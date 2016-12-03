//
//  ShopViewController.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/22/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class ShopViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout {
    
    var store : Store?
    
    @IBOutlet weak var collectionView: UICollectionView!
    
    @IBOutlet weak var flowLayout: UICollectionViewFlowLayout!
    
    var products = [Product]()
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        collectionView.delegate = self
        collectionView.dataSource = self
        
        

        
        // flow layout stuff
//        collectionView.setContentOffset(CGPoint(), animated: <#T##Bool#>)
//        flowLayout.scrollDirection = .horizontal
        flowLayout.minimumLineSpacing = 0
        flowLayout.minimumInteritemSpacing = 1
        flowLayout.sectionInset = UIEdgeInsetsMake(0, 0, 0, 0)
        
        // perform network request
        WalmartClient.sharedInstance.getProductsWithSearchTerm(term: "dress", success: { (products: [Product]) in
            // save product and present correct view
            let storyboard = UIStoryboard(name: "Main", bundle: nil)
            
            // get additional information
            for product in products {
                // get product related info images
            }
            
            self.products = products
            self.collectionView.reloadData()
            
        }, failure: {(error: Error) -> () in
            print(error.localizedDescription)
        })
        
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
            let cell = image.superview?.superview?.superview as! ProductOverviewCell
            
        if sender.state == .began {
            let velocity = sender.velocity(in: self.view)
            if velocity.x > 0 {
                print("swiped right")
                guard let variantImagesArray = cell.product.variantImages else {
                    print("stuck here")
                    print(cell.product.variants)
                    return }
                if let variantImageUrl = variantImagesArray[0] as? URL {
                    cell.productImage.setImageWith(variantImageUrl)
                        collectionView.reloadData()
                } else {
                    print("stuck getting here")
                }
            } else if velocity.x < 0 {
                print("swiped left")
                guard let variantImagesArray = cell.product.variantImages else {return }
                if let variantImageUrl = variantImagesArray[0] as? URL {
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
            border.backgroundColor = UIColor.lightGray
            cell.addSubview(border)
        }
        
        if indexPath.row != 0 && indexPath.row != 1 {
            // top border
            let borderWidth = CGFloat(1)
            let y = cell.frame.origin.y
            let frame = CGRect(x: 0, y: 0, width: cell.frame.size.width, height: borderWidth)
            let border = UIView(frame: frame)
            border.backgroundColor = UIColor.lightGray
            cell.addSubview(border)
        }
        
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAtIndexPath indexPath: NSIndexPath) -> CGSize {
        
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

}
