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
    @IBOutlet weak var descriptionLabel: UILabel!
    @IBOutlet weak var priceLabel: UILabel!
    
    @IBOutlet weak var productImageView: UIImageView!
    
    var product: Product!
    
    private var wasNavHidden: Bool!
    
    override func viewDidLoad() {        
        super.viewDidLoad()
        wasNavHidden = self.navigationController?.isNavigationBarHidden ?? false
        self.navigationController?.setNavigationBarHidden(false, animated: true)
        self.navigationItem.rightBarButtonItem = nil
        self.navigationItem.leftBarButtonItem = nil
        self.navigationItem.setHidesBackButton(true, animated: false)
        
        display(product: product)
    }

    /** set the information for this controller */
    private func display(product: Product) {
        nameLabel.text = product.name
        descriptionLabel.text = product.overview ?? ""
        priceLabel.text = product.salePriceAsString
        product.setProductImage(view: productImageView)
    }

    @IBAction func onAddButton(_ sender: UIButton) {
        User.currentUser?.current.products.append(product)
        
        guard let fromView = self.tabBarController?.selectedViewController?.view else { return }
        guard let toView = self.tabBarController?.viewControllers?[2].view else { return }
        
        UIView.transition(from: fromView, to: toView, duration: 0.5, options: .transitionCrossDissolve, completion: { if $0 {
            self.tabBarController?.selectedIndex = 2
            self.navigationController?.setNavigationBarHidden(self.wasNavHidden, animated: false)
            let _ = self.navigationController?.popToRootViewController(animated: false)
        }})
    }
    @IBAction func onCancelButton(_ sender: UIButton) {
        self.tabBarController?.selectedIndex = 1
        self.navigationController?.setNavigationBarHidden(wasNavHidden, animated: true)
        let _ = self.navigationController?.popToRootViewController(animated: true)
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        self.navigationController?.setNavigationBarHidden(wasNavHidden, animated: true)
    }
}
