//
//  ProductViewController.swift
//  FastCart
//
//  Created by Luis Perez on 12/4/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class ProductDetailsViewController: UIViewController, ImageScrollViewDataSource {
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var priceLabel: UILabel!
    
    @IBOutlet weak var productScrollView: ImageScrollView!
    
    var product: Product!
    
    @IBOutlet weak var ratingsLabel: UILabel!
    
    @IBOutlet weak var reviewsImageView: UIImageView!
    
    private var wasNavHidden: Bool!
    
    @IBOutlet weak var fixedView: UIView!
    
    override func viewDidLoad() {        
        super.viewDidLoad()
        
        // Set-up the scrollable image.
        self.productScrollView.datasource = self
        self.productScrollView.placeholderImage = #imageLiteral(resourceName: "noimagefound")
        self.productScrollView.show()
    
        display(product: product)
        
        
        // Add reviews.
        fixedView.center.y = fixedView.center.y + fixedView.frame.size.height
        UIView.animateKeyframes(withDuration: 1, delay: 0, options: [], animations: { (success) -> () in
            self.fixedView.center.y = self.fixedView.center.y - self.fixedView.frame.size.height
        
        }, completion: nil)
        
        
        // Reviews image.
        let tapGestureRecognizer = UITapGestureRecognizer(target:self, action:#selector(ProductDetailsViewController.onTapReviews))
        reviewsImageView.addGestureRecognizer(tapGestureRecognizer)
        reviewsImageView.isUserInteractionEnabled = true
    }
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        wasNavHidden = self.navigationController?.isNavigationBarHidden ?? false
        self.navigationItem.rightBarButtonItem = nil
        self.navigationItem.leftBarButtonItem = nil
        self.navigationItem.setHidesBackButton(false, animated: false)
        navigationController?.setNavigationBarHidden(false, animated: true)
    }
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        navigationController?.setNavigationBarHidden(self.wasNavHidden, animated: false)
    }

    func onTapReviews(){
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let reviewsViewController = storyboard.instantiateViewController(withIdentifier: "ReviewsViewController") as! ReviewsViewController
        reviewsViewController.itemId = (product.idFromStore)!
        navigationController?.setNavigationBarHidden(false, animated: false)
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
    }
    
    /** MARK - DTImageScrollViewDataSource */
    func numberOfImages() -> Int {
        return product.variantImages.count
    }
    func imageURL(index: Int) -> URL {
        return product.variantImages[index] as URL
    }

    @IBAction func onAddButton(_ sender: UIButton) {
        User.currentUser?.current.products.insert(product, at: 0)
        
        self.tabBarController?.switchToList(at: 1)
        self.tabBarController?.selectedIndex = 2
        let _ = self.navigationController?.popToRootViewController(animated: true)
    }
    @IBAction func onCancelButton(_ sender: UIButton) {
        let _ = self.navigationController?.popViewController(animated: true)
    }
}
