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
        print("navigating to reviews")
        self.performSegue(withIdentifier: "reviewsSegue", sender: nil)
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
        
        guard let fromView = self.tabBarController?.selectedViewController?.view else { return }
        guard let toView = self.tabBarController?.viewControllers?[2].view else { return }
        
        UIView.transition(from: fromView, to: toView, duration: 0.7, options: .transitionCrossDissolve, completion: { if $0 {
            self.tabBarController?.selectedIndex = 2
            self.navigationController?.setNavigationBarHidden(self.wasNavHidden, animated: false)
            let _ = self.navigationController?.popToRootViewController(animated: true)
        }})
    }
    @IBAction func onCancelButton(_ sender: UIButton) {
//        self.tabBarController?.selectedIndex = 1
        self.navigationController?.setNavigationBarHidden(wasNavHidden, animated: true)
        let _ = self.navigationController?.popViewController(animated: true)
    }

//    @IBAction func onSeeReviews(_ sender: Any) {
//        print("navigating to reviews")
//        self.performSegue(withIdentifier: "reviewsSegue", sender: nil)
//    }
    
    
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {

//self.navigationController?.setNavigationBarHidden(wasNavHidden, animated: true)

        if (segue.identifier == "reviewsSegue"){
            let navigationViewController = segue.destination as! UINavigationController
            let reviewViewController = navigationViewController.topViewController as! ReviewsViewController
            
            reviewViewController.itemId = (product?.idFromStore)!
            
        }
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
 

}
