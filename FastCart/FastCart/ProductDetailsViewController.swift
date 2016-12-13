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
    
    @IBOutlet weak var rootView: UIView!
    @IBOutlet weak var scrollView: UIScrollView!
    @IBOutlet weak var fixedView: UIView!
    @IBOutlet weak var productScrollView: ImageScrollView!
    @IBOutlet weak var contentView: UIView!
    
    var product: Product!
    
    @IBOutlet weak var ratingsLabel: UILabel!
    @IBOutlet weak var similarItemsContentView: UIView!
    @IBOutlet weak var reviewsImageView: UIImageView!
    
    private var wasNavHidden: Bool!
    private let kOfferSize = CGSize(width: 100, height: 100)

    @IBOutlet weak var pricePlaceHolder: UIView!
    @IBOutlet weak var similarItemsPlaceHolder: UIView!
    
    @IBOutlet weak var heightConstraintForReviewsImage: NSLayoutConstraint!
    @IBOutlet weak var topConstraintForTopHiddenView: NSLayoutConstraint!
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        // Add fixed view at the bottom and set content size.
        self.scrollView.contentInset.bottom = fixedView.frame.height + 10
    }
    
    override func viewDidLoad() {        
        super.viewDidLoad()
        
        // Change the top contraint constant to match the screen size.
        topConstraintForTopHiddenView.constant = rootView.frame.height - rootView.frame.origin.y - fixedView.frame.height - (self.navigationController?.navigationBar.frame.height ?? 0)
        
        // Set-up the scrollable image.
        self.productScrollView.datasource = self
        self.productScrollView.placeholderImage = #imageLiteral(resourceName: "noimagefound")
        self.productScrollView.show()
    
        display(product: product)
        
        // Animate upwards
        fixedView.frame.origin.y = self.view.frame.origin.y + self.view.frame.height
        UIView.animateKeyframes(withDuration: 1, delay: 0, options: [], animations: { (success) -> () in
            self.fixedView.frame.origin.y = self.fixedView.frame.origin.y - self.fixedView.frame.size.height
        
        }, completion: { (success: Bool) -> Void in
            self.similarItemsContentView.isHidden = false
        })
        
        
        // Reviews image.
        let tapGestureRecognizer = UITapGestureRecognizer(target:self, action:#selector(ProductDetailsViewController.onTapReviews))
        reviewsImageView.addGestureRecognizer(tapGestureRecognizer)
        reviewsImageView.isUserInteractionEnabled = true
        
        // Setup other stores price comparions
        self.setUpOtherStores(in: pricePlaceHolder)
        
        self.setUpOtherItems(in: similarItemsPlaceHolder)
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
    private func notAvailable(_ placeHolder: UIView) {
        let label = UILabel()
        label.text = "Not Available"
        label.textAlignment = .center
        placeHolder.addLayoutSubview(label, andConstraints:
            label.centerY,
            label.left,
            label.right
        )
    }
    private func getStandardScrollView(for view: UIView) -> ASHorizontalScrollView {
        let horizontalScrollView = ASHorizontalScrollView(frame: view.bounds)
        horizontalScrollView.uniformItemSize = kOfferSize
        horizontalScrollView.setItemsMarginOnce()
        horizontalScrollView.isUserInteractionEnabled = true
        horizontalScrollView.frame = view.bounds
        return horizontalScrollView
    }
    private func setUpOtherItems(in view: UIView) {
        guard let itemId = product.idFromStore else { return notAvailable(view) }
        view.isUserInteractionEnabled = true
        let horizontalScrollView = getStandardScrollView(for: view)
        // Override size
        horizontalScrollView.uniformItemSize = CGSize(width: kOfferSize.width, height: 2 * kOfferSize.height)
        let activityIndicator = Utilities.addActivityIndicator(to: view)
        activityIndicator.startAnimating()
        WalmartClient.sharedInstance.getSimilarProducts(itemId: itemId, success: {(products: [Product]) -> () in
            for product in products {
                let frame = CGRect(x: 0, y:0, width: self.kOfferSize.width, height: 2 * self.kOfferSize.height)
                let productCell = SimilarProductView(frame: frame)
                productCell.product = product
                productCell.isUserInteractionEnabled = true
                horizontalScrollView.addItem(productCell)
            }
            view.addSubview(horizontalScrollView)
            activityIndicator.stopAnimating()
        }, failure: {(error: Error) -> () in
            self.notAvailable(view)
            activityIndicator.stopAnimating()
        })
    }
    private func setUpOtherStores(in view: UIView) {
        guard let upc
            = product.upc else { return notAvailable(view) }
        let horizontalScrollView = getStandardScrollView(for: view)
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
            self.notAvailable(view)
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
        } else {
            // Hide the rating URL view by shrinking it.
            heightConstraintForReviewsImage.constant = 0
            
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
