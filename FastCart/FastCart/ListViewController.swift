//
//  ListsViewController.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class ListViewController: UIViewController, UITableViewDataSource, UITableViewDelegate, UITextViewDelegate {

    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var subtotalLabel: UILabel!
    
    @IBOutlet weak var subtotalTitleLabel: UILabel!
    @IBOutlet weak var checkoutButton: UIButton!
    
    @IBOutlet weak var addItemTextView: UITextView!
    var cartViews = [UIView]()
    var emptyViews = [UIView]()
    
    let PLACEHOLDER_TEXT = "Type or tap the camera to scan an item"
    
    var products = [Product]() {
        didSet(oldValue) {
            // Only update if we can update User.
            if let user = User.currentUser {
                let receipt = user.current
                if products.count > 0 {
                    hideAndShowViewsWithAnimation(show: self.cartViews, hide: self.emptyViews)
                } else {
                    hideAndShowViewsWithAnimation(show: self.emptyViews, hide: self.cartViews)
                }
                receipt.products = products
                subtotalLabel.text = receipt.subTotalAsString
                user.persistCurrent()
            }
            else {
                products = oldValue
            }
        }
    }
    
    @IBOutlet weak var readyLabel: UILabel!
    
    func hideAndShowViewsWithAnimation(show: [UIView], hide: [UIView]) {
        UIView.animate(withDuration: 0, delay: 0, options: UIViewAnimationOptions.curveEaseOut, animations:  {
            // hide views
            for view in hide {
                view.alpha = 0
            }
        }, completion: {(success: Bool) -> () in
            UIView.animate(withDuration: 0.5, delay: 0, options: UIViewAnimationOptions.curveEaseOut, animations:  {
                // show views
                for view in show {
                    view.alpha = 1
                }
            }, completion: nil)
        })
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.delegate = self
        tableView.dataSource = self
        
        // Do any additional setup after loading the view.
        // so it resizes
        tableView.rowHeight = UITableViewAutomaticDimension
        // for the scrollbar
        tableView.estimatedRowHeight = 120
        
        addItemTextView.delegate = self
        
        // format checkout button
        checkoutButton.layer.cornerRadius = 5
        
        // make appropriate things hidden
        cartViews = [subtotalLabel, subtotalTitleLabel, checkoutButton]
        emptyViews = [readyLabel]
    }

    func addProduct() {
        let product = Product(dictionary: ["name": addItemTextView.text], api: apiType.manual)
        products = products + [product]
        tableView.reloadData()
        addItemTextView.text = "Type or tap the camera to scan an item"
    }
    
    func textViewDidBeginEditing(_ textView: UITextView) {
        textView.text = ""
    }
    
    func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
        if(text == "\n") {
            textView.resignFirstResponder()
            addProduct()
            return false
        }
        return true
    }
    
    override func viewWillAppear(_ animated: Bool) {
        if let currentProducts = User.currentUser?.current.products {
            products = currentProducts
        }
        tableView.reloadData()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    /*
    // MARK: - UITableViewDelegate
    */
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return products.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "ProductCell") as! ProductCell
        cell.product = products[indexPath.row]
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        // deselect the cell and get relevant product
        tableView.deselectRow(at: indexPath, animated: true)
        let product = products[indexPath.row]
        
        // prepare for segue
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        
        let productDetailsViewController = storyboard.instantiateViewController(withIdentifier: "ProductDetailsViewController") as! ProductDetailsViewController
        productDetailsViewController.product = product
        self.navigationController?.pushViewController(productDetailsViewController, animated: true)
        
    }
    
    func tableView(_ tableView: UITableView, editActionsForRowAt indexPath: IndexPath) -> [UITableViewRowAction]? {
        let delete = UITableViewRowAction(style: .normal, title: "Delete") { (action, index) in
            // Note that this call the didSet listener!
            self.products.remove(at: indexPath.row)
            tableView.reloadData()
        
        // TODO: remove from parse
        }
        delete.backgroundColor = UIColor.red
        
        return [delete]
    }
    
    @IBAction func onScanButton(_ sender: Any) {
        self.tabBarController?.selectedIndex = 1
    }
    
    // checkout button
    
    @IBAction func onCheckoutButton(_ sender: Any) {
        // check to see if there are unscanned products
        for product in products {
            // check to see if there are unscanned products
            if product.upc == nil {
                let alert = UIAlertController(title: "Oops!", message: "Looks like there are unscanned items in your cart. You'll have to either remove these items or scan to proceed.", preferredStyle: UIAlertControllerStyle.alert)
                alert.addAction(UIAlertAction(title: "Got it!", style: UIAlertActionStyle.default, handler: nil))
                self.present(alert, animated: true, completion: nil)
                return
                
            }
        }
        
        tabBarController?.selectedIndex = 3
    }
    
}
