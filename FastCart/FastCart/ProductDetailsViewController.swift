//
//  ProductViewController.swift
//  FastCart
//
//  Created by Luis Perez on 12/4/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class ProductDetailsViewController: UIViewController {
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var priceLabel: UILabel!
    
    @IBOutlet weak var productImageView: UIImageView!
    
    var product: Product!
    
    @IBOutlet weak var ratingsLabel: UILabel!
    
    @IBOutlet weak var reviewsImageView: UIImageView!
    

    private var wasNavHidden: Bool!
    
    @IBOutlet weak var fixedView: UIView!
    
    override func viewDidLoad() {        
        super.viewDidLoad()
        wasNavHidden = self.navigationController?.isNavigationBarHidden ?? false
        self.navigationController?.setNavigationBarHidden(false, animated: true)
        self.navigationItem.rightBarButtonItem = nil
        self.navigationItem.leftBarButtonItem = nil
        self.navigationItem.setHidesBackButton(true, animated: false)
        
        display(product: product)
        fixedView.center.y = fixedView.center.y + fixedView.frame.size.height
        // Start the animation
        UIView.animateKeyframes(withDuration: 1, delay: 0, options: [], animations: { (success) -> () in
            self.fixedView.center.y = self.fixedView.center.y - self.fixedView.frame.size.height
        
        }, completion: nil)
        
        
        let tapGestureRecognizer = UITapGestureRecognizer(target:self, action:#selector(ProductDetailsViewController.onTapReviews))
        reviewsImageView.addGestureRecognizer(tapGestureRecognizer)
        reviewsImageView.isUserInteractionEnabled = true
    }

    func onTapReviews(){
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let reviewsViewController = storyboard.instantiateViewController(withIdentifier: "ReviewsViewController") as! ReviewsViewController
        reviewsViewController.itemId = (product.idFromStore)!
        self.navigationController?.pushViewController(reviewsViewController, animated: true)
    }
    
    /** set the information for this controller */
    private func display(product: Product) {
        nameLabel.text = product.name
        priceLabel.text = product.salePriceAsString
        ratingsLabel.text = product.averageRating
        if let ratingUrl = product.ratingImage {
            reviewsImageView.setImageWith(ratingUrl)
        }
        product.setProductImage(view: productImageView)
    }

    @IBAction func onAddButton(_ sender: UIButton) {
        User.currentUser?.current.products.append(product)
        
        self.tabBarController?.selectedIndex = 2
        self.navigationController?.setNavigationBarHidden(self.wasNavHidden, animated: false)
        let _ = self.navigationController?.popToRootViewController(animated: true)
    }
    @IBAction func onCancelButton(_ sender: UIButton) {
        self.navigationController?.setNavigationBarHidden(wasNavHidden, animated: true)
        let _ = self.navigationController?.popViewController(animated: true)
    }
}
