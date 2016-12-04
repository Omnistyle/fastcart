//
//  ShopViewController.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/22/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import TLYShyNavBar
import SCLAlertView

class ShopViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout {
    
    var store : Store?
    
    @IBOutlet weak var collectionView: UICollectionView!
    
    @IBOutlet weak var flowLayout: UICollectionViewFlowLayout!
    
    private var activityIndicator: UIActivityIndicatorView!
    
    var products = [Product]()
    var searchTerm = "dress"
    override func viewDidLoad() {
        super.viewDidLoad()
        
        createErrorAlert()
        
        // Add activitiy indicator.
        self.activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .gray)
        self.activityIndicator.center = self.view.center;
        self.view.addSubview(self.activityIndicator)

        // Do any additional setup after loading the view.
        collectionView.delegate = self
        collectionView.dataSource = self
        
        self.shyNavBarManager.scrollView = self.collectionView
        
        
        self.title = "Shop"
        
        // flow layout stuff
//        collectionView.setContentOffset(CGPoint(), animated: <#T##Bool#>)
//        flowLayout.scrollDirection = .horizontal
        flowLayout.minimumLineSpacing = 0
        flowLayout.minimumInteritemSpacing = 1
        flowLayout.sectionInset = UIEdgeInsetsMake(0, 0, 0, 0)
        
        // perform network request
        self.activityIndicator.startAnimating()
        WalmartClient.sharedInstance.getProductsWithSearchTerm(term: searchTerm, startIndex: "1", success: { (products: [Product]) in
            // get additional information
            for _ in products {
                // get product related info images
            }
            
            self.products = products
            self.activityIndicator.stopAnimating()
            self.collectionView.reloadData()
            
        }, failure: {(error: Error) -> () in
            self.activityIndicator.stopAnimating()
            print(error.localizedDescription)
        })
        
    }
    private func createErrorAlert() {
        // Complete the receipt.
        let appearance = SCLAlertView.SCLAppearance(
            kCircleIconHeight: 40.0,
            showCloseButton: true
            
        )
        let alertView = SCLAlertView(appearance: appearance)
        let alertViewIcon = #imageLiteral(resourceName: "fastcartIcon")
        alertView.showTitle(
            "Nice!\n",
            subTitle: "\nYou're done with checkout.\n",
            style: SCLAlertViewStyle.notice,
            duration: 0.0 ,
            circleIconImage: alertViewIcon
        )
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return products.count
    }
    
    func handleTap(sender: UITapGestureRecognizer) {
        if let image = sender.view as? UIImageView {
            let cell = image.superview!.superview as! ProductOverviewCell
            if cell.heartImage.image == #imageLiteral(resourceName: "heart") {
                cell.heartImage.image = #imageLiteral(resourceName: "heart_filled")
            } else {
              cell.heartImage.image = #imageLiteral(resourceName: "heart")
            }

            
            let pulseAnimation:CABasicAnimation = CABasicAnimation(keyPath: "transform.scale")
            pulseAnimation.duration = 0.5
            pulseAnimation.toValue = NSNumber(value: 1.2)
            pulseAnimation.timingFunction = CAMediaTimingFunction(name: kCAMediaTimingFunctionEaseInEaseOut)
            pulseAnimation.autoreverses = true
            pulseAnimation.repeatCount = 1
            cell.heartImage.layer.add(pulseAnimation, forKey: nil)
            
        }

    }
    
    func handleSwipe(sender: UIPanGestureRecognizer) {
        if let image = sender.view as? UIImageView {
            let cell = image.superview?.superview as! ProductOverviewCell
            
        if sender.state == .began {
            let velocity = sender.velocity(in: self.view)
            if velocity.x > 0 {
                print("swiped right")
                guard cell.product.variantImages.count > 0 else {
                    print("apparently no other images")
                    return }
                let originalX = cell.productImage.frame.origin.x
                let originalY =  cell.productImage.frame.origin.y
                if let variantImageUrl = cell.product.variantImages[0] as? URL {
                    var toPoint: CGPoint = CGPoint(x: originalX + cell.frame.size.width / 2, y: originalY)
                    var fromPoint : CGPoint = CGPoint(x: originalX, y: originalY)
                    var movement = CABasicAnimation(keyPath: "movement")
                    movement.isAdditive = true
                    movement.fromValue =  NSValue(cgPoint: fromPoint)
                    movement.toValue =  NSValue(cgPoint: toPoint)
                    movement.duration = 0.3

                    view.layer.add(movement, forKey: "move")
                    cell.productImage.setImageWith(variantImageUrl)
                    
                        collectionView.reloadData()
                } else {
                    print("stuck getting here")
                }
            } else if velocity.x < 0 {
                print("swiped left")
                guard cell.product.variantImages.count > 0 else {return }
                
                if let variantImageUrl = cell.product.variantImages[0] as? URL {
                    cell.productImage.setImageWith(variantImageUrl)
                }

            }
        }
        }
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "ProductOverviewCell", for: indexPath) as! ProductOverviewCell
        cell.product = products[indexPath.row]
        
        // add tap target
        let tap = UITapGestureRecognizer(target: self, action: #selector(ShopViewController.handleTap))
        //        tapGestureRecognizer.addTarget(self, action:#selector(TweetsViewController.profileTapGestureRecognizer as (TweetsViewController) -> () -> ()))
        cell.heartImage.addGestureRecognizer(tap)
        // add scroll target
        cell.heartImage.isUserInteractionEnabled = true
        let swipe = UIPanGestureRecognizer(target: self, action: #selector(ShopViewController.handleSwipe))
        cell.productImage.addGestureRecognizer(swipe)
        cell.productImage.isUserInteractionEnabled = true
        // no top border for first two
        // if it's even
        if indexPath.row % 2 == 1 {
            let borderWidth = CGFloat(1)
            let x = cell.frame.origin.x
            
            let frame = CGRect(x: 0, y: 0, width: borderWidth, height: collectionView.contentSize.height)
            let border = UIView(frame: frame)
            border.backgroundColor = UIColor(red: 240/255, green: 240/255, blue: 240/255, alpha: 1)
            cell.addSubview(border)
        }
        
        if indexPath.row != 0 && indexPath.row != 1 {
            // top border
            let borderWidth = CGFloat(1)
            let y = cell.frame.origin.y
            let frame = CGRect(x: 0, y: 0, width: cell.frame.size.width, height: borderWidth)
            let border = UIView(frame: frame)
            border.backgroundColor = UIColor(red: 240/255, green: 240/255, blue: 240/255, alpha: 1)
            cell.addSubview(border)
        }
        
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: NSIndexPath) -> CGSize {
        
        // set to 4 per grid
        return CGSize(width: CGFloat(collectionView.frame.size.width / 2 - 0.5), height: collectionView.bounds.size.height / 2)
       
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
//        let product = products[indexPath.row]
//        let storyboard = UIStoryboard(name: "Main", bundle: nil)
//        let vc = storyboard.instantiateViewController(withIdentifier: "ProductDetailsWithScrollViewController") as! ProductDetailsViewController
//        vc.product = product
//        self.navigationController?.pushViewController(vc, animated: true)
        
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */
    var isMoreDataLoading = false
    
    func loadMoreData() {
        let count = products.count
        let newCount = String(count + 10)
        let startIndex = String(count + 1)
        WalmartClient.sharedInstance.getProductsWithSearchTerm(term: searchTerm, startIndex: startIndex, success: {
             (products: [Product]) in
                // populate tableview with tweets
                self.products = self.products + products
                self.collectionView.reloadData()
                self.isMoreDataLoading = false
                // Stop the loading indicator
//                self.loadingMoreView!.stopAnimating()
            
            
            
        }, failure: {(error: Error) -> () in
            print(error.localizedDescription)
        })
    }

}
