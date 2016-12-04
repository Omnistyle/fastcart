//
//  ProductDetailsViewController.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/7/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import AFNetworking



class ProductDetailsViewController: UIViewController {
   
    var product: Product?
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var descriptionLabel: UILabel!
    @IBOutlet weak var priceLabel: UILabel!
    @IBOutlet weak var descriptionContainerView: UIView!
    @IBOutlet weak var productImageView: UIImageView!
    
    
    @IBOutlet weak var scrollView: UIScrollView!
    @IBOutlet weak var contentView: UIView!
    
    @IBOutlet weak var tableView: UITableView!
    override func viewDidLoad() {
        super.viewDidLoad()
        nameLabel.text = product?.name ?? ""
        descriptionLabel.text = product?.overview ?? ""
        if let salePrice = product?.salePrice {
            priceLabel.text = "$" + String(describing: salePrice)
        }
        if let imageUrl = product?.image {
            productImageView.setImageWith(imageUrl as URL)
        }
        // Do any additional setup after loading the view.
    
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

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func onCancelButton(_ sender: Any) {
        self.dismiss(animated: true, completion: nil)
    }
    @IBAction func onAddButton(_ sender: Any) {
        if self.product != nil {
            User.currentUser?.current.products.append(product!)
        }
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let vc = storyboard.instantiateViewController(withIdentifier: "tabBarController") as! UITabBarController
        // select the list index
        vc.selectedIndex = 2
        present(vc, animated: true, completion: nil)
        
//        self.dismiss(animated: true, completion: nil)
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
