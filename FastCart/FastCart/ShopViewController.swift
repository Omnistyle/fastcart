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
    
    // Maps the item index to the current variant image index.
    private var variantIndexFor: [Int: Int] = [:]
    
    var products = [Product]()
    var searchTerm = "dress"
    override func viewDidLoad() {
        super.viewDidLoad()
    
        // Add activitiy indicator.
        self.activityIndicator = Utilities.addActivityIndicator(to: self.view)

        // Do any additional setup after loading the view.
        collectionView.delegate = self
        collectionView.dataSource = self
        
        self.shyNavBarManager.scrollView = self.collectionView
        
        self.title = "Shop"
        
        // flow layout stuff
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
            Utilities.presentErrorAlert(title: "Network Failure", message: error.localizedDescription)
        })
        
    }

    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return products.count
    }
    
    func handleTap(sender: UITapGestureRecognizer) {
        if let image = sender.view as? UIImageView {
            let cell = image.superview!.superview?.superview as! ProductOverviewCell
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
            let cell = image.superview?.superview?.superview as! ProductOverviewCell
            
        if sender.state == .began {
            let velocity = sender.velocity(in: self.view)
            guard cell.product.variantImages.count > 0 else {
                print("No other variant images")
                return
            }
        
            guard let item = collectionView.indexPath(for: cell)?.item else {
                print("Invalid item in collection view")
                return
            }
            var index = variantIndexFor[item] ?? 0
            if velocity.x > 0 {
                index = (index + 1) % cell.product.variantImages.count
            } else if velocity.x < 0 {
                if index > 0 {
                    index = (index - 1) % cell.product.variantImages.count
                } else {
                    index = cell.product.variantImages.count - 1
                }
            }
            print(index)
            variantIndexFor[item] = index
            let variantImageUrl = cell.product.variantImages[variantIndexFor[item]!] as URL
            cell.productImage.image = nil
            cell.productImage.setImageWith(variantImageUrl)
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
        let swipe = PanDirectionGestureRecognizer(direction:PanDirection.horizontal, target: self, action: #selector(ShopViewController.handleSwipe))
        cell.productImage.addGestureRecognizer(swipe)
        cell.productImage.isUserInteractionEnabled = true
        // no top border for first two
        // if it's even
        if indexPath.row % 2 == 1 {
            let borderWidth = CGFloat(1)
            
            let frame = CGRect(x: 0, y: 0, width: borderWidth, height: collectionView.contentSize.height)
            let border = UIView(frame: frame)
            border.backgroundColor = UIColor(red: 240/255, green: 240/255, blue: 240/255, alpha: 1)
            cell.addSubview(border)
        }
        
        if indexPath.row != 0 && indexPath.row != 1 {
            // top border
            let borderWidth = CGFloat(1)
            let frame = CGRect(x: 0, y: 0, width: cell.frame.size.width, height: borderWidth)
            let border = UIView(frame: frame)
            border.backgroundColor = UIColor(red: 240/255, green: 240/255, blue: 240/255, alpha: 1)
            cell.addSubview(border)
        }
        
        // Overwrite current image if the user has already swiped through them.
        if let variantIndex = variantIndexFor[indexPath.item] {
            cell.productImage.setImageWith(products[indexPath.row].variantImages[variantIndex] as URL)
            
        }
        
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        
        // Sets to 4 per screen.
        return CGSize(width: CGFloat(collectionView.frame.size.width / 2 - 0.5), height: collectionView.frame.size.height / 2 - 0.5)
       
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let product = products[indexPath.row]
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let vc = storyboard.instantiateViewController(withIdentifier: "ProductDetailsViewController") as! ProductDetailsViewController
        vc.product = product
        vc.hidesBottomBarWhenPushed = true
        self.navigationController?.pushViewController(vc, animated: true)
        
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
