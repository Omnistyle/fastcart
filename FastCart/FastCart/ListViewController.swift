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
        didSet {
            // show and hide relevant headers
            if products.count > 0 {
                hideAndShowViewsWithAnimation(show: self.cartViews, hide: self.emptyViews)
            } else {
                hideAndShowViewsWithAnimation(show: self.emptyViews, hide: self.cartViews)
            }
            var subtotal = 0.0
            for product in products {
                if let price = product.salePrice {
                    subtotal = subtotal + price
                }
            }
            
            // update subtotal
            self.subtotal = subtotal
            // update the current user
            User.currentUser?.current.products = products
            
        }
    }
    
    var subtotal = 0.00 {
        didSet {
            subtotalLabel.text = "$" + String(describing: subtotal)
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
        User.currentUser?.current.products.append(product)
        products.append(product)
        
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
    
    @IBAction func onCheckout(_ sender: UIButton) {
        // TODO: Implement checkout functionality.
    }

    @IBAction func onAddItemWithScanner(_ sender: UIButton) {
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
        
        let navigationController = storyboard.instantiateViewController(withIdentifier: "ProductDetailsNavigationController") as! UINavigationController
        
        let productDetailsViewController = navigationController.topViewController as! ProductDetailsViewController
        productDetailsViewController.product = product
        
        // segue to the details view
        self.show(navigationController, sender: self)
        
    }
    
    func tableView(_ tableView: UITableView, editActionsForRowAt indexPath: IndexPath) -> [UITableViewRowAction]? {
        let delete = UITableViewRowAction(style: .normal, title: "Delete") { action, index in
        let product = self.products[indexPath.row]
            
            
        // remove from our array immediately
        self.products.remove(at: indexPath.row)
            
        tableView.reloadData()
        
        // TODO: remove from parse
        }
        delete.backgroundColor = UIColor.red
        
        return [delete]
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */
    
    @IBAction func onScanButton(_ sender: Any) {
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let vc = storyboard.instantiateViewController(withIdentifier: "ScanViewController")
        present(vc, animated: true, completion: nil)
    }
    
    // checkout button
    
    @IBAction func onCheckoutButton(_ sender: Any) {
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
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
        
        let vc = storyboard.instantiateViewController(withIdentifier: "tabBarController") as! UITabBarController
        // select the list index
        vc.selectedIndex = 3
        present(vc, animated: true, completion: nil)
    }
    
}
