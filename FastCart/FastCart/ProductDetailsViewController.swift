//
//  ProductViewController.swift
//  FastCart
//
//  Created by Luis Perez on 12/4/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import ASHorizontalScrollView
import MisterFusion

class ProductDetailsViewController: UIViewController, ImageScrollViewDataSource {
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var priceLabel: UILabel!
    
    @IBOutlet weak var productScrollView: ImageScrollView!
    
    var product: Product!
    
    @IBOutlet weak var ratingsLabel: UILabel!
    
    @IBOutlet weak var reviewsImageView: UIImageView!
    
    private var wasNavHidden: Bool!
    private let kOfferSize = CGSize(width: 80, height: 80)
    
    @IBOutlet weak var fixedView: UIView!
    @IBOutlet weak var pricePlaceHolder: UIView!
    
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
        
        // Setup other stores price comparions
        self.setUpOtherStores(in: pricePlaceHolder)
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
    
    // Set-up horizontal scroll in view for other stores.
    private func noStoresAvailable() {
        let label = UILabel()
        label.text = "Not Available"
        label.textAlignment = .center
        pricePlaceHolder.addLayoutSubview(label, andConstraints:
            label.top |+| 8,
            label.left |+| 8,
            label.right |+| 8
        )
    }
    private func setUpOtherStores(in view: UIView) {
        guard let upc = product.upc else { return noStoresAvailable() }
        let horizontalScrollView = ASHorizontalScrollView(frame: view.bounds)
        horizontalScrollView.uniformItemSize = kOfferSize
        horizontalScrollView.setItemsMarginOnce()
        let activityIndicator = Utilities.addActivityIndicator(to: view)
        activityIndicator.startAnimating()
        UPCClient.sharedInstance.getOffers(upc: upc, success: {(offers: [Offer]) -> () in
            for offer in offers {
                let frame = CGRect(x: 0, y:0, width: self.kOfferSize.width, height: self.kOfferSize.height)
                let view = OfferView(frame: frame)
                view.offer = offer
                horizontalScrollView.addItem(view)
            }
            view.addSubview(horizontalScrollView)
            activityIndicator.stopAnimating()
        }, failure: {(error: Error) -> () in
            self.noStoresAvailable()
            activityIndicator.stopAnimating()
        })
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
        
        self.tabBarController?.switchTo(listTab: .receipt)
        let _ = self.navigationController?.popToRootViewController(animated: true)
    }
    @IBAction func onCancelButton(_ sender: UIButton) {
        let _ = self.navigationController?.popViewController(animated: true)
    }
}
