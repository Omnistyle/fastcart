//
//  ProductDetailsViewController.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/7/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import AFNetworking



class ProductDetailsWithScrollViewController: UIViewController {
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var descriptionLabel: UILabel!
    @IBOutlet weak var priceLabel: UILabel!
    @IBOutlet weak var descriptionContainerView: UIView!
    @IBOutlet weak var productImageView: UIImageView!
    
    
    @IBOutlet weak var scrollView: UIScrollView!
    @IBOutlet weak var contentView: UIView!
    
    @IBOutlet weak var tableView: UITableView!
    
    var product: Product!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        display(product: product)
        
        // Always show the navigation bar if available.
        self.navigationController?.isNavigationBarHidden = false
 
        // Currently use class for both scroll and non-scroll.
        _ = scrollView.bounds.width
        _ = scrollView.bounds.height * 3
        
        // add additional sections
        let frame = CGRect(x: CGFloat(0), y: CGFloat(20) + contentView.bounds.height, width: view.bounds.width, height: CGFloat(200))
        let reviewView = ProductReviews(frame: frame)
        
        contentView.frame = CGRect(x: CGFloat(0), y: CGFloat(20) + contentView.bounds.height, width: view.bounds.width, height: view.bounds.height + reviewView.bounds.height)
        
        scrollView.addSubview(contentView)
        scrollView.contentSize = CGSize(width: contentView.bounds.width, height: contentView.bounds.height)
        
        contentView.addSubview(reviewView)
    }
    
    @IBAction func onAddButton(_ sender: Any) {
        User.currentUser?.current.products.append(product)
        self.tabBarController?.selectedIndex = 2
        let _ = self.navigationController?.popToRootViewController(animated: false)
    }
    
    /** set the information for this controller */
    private func display(product: Product) {
        nameLabel.text = product.name
        descriptionLabel.text = product.overview ?? ""
        priceLabel.text = product.salePriceAsString
        product.setProductImage(view: productImageView)
    }
}
