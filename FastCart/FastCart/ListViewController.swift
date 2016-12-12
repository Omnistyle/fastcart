//
//  ListsViewController.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import BraintreeDropIn
import Braintree

class ListViewController: UIViewController, UITableViewDataSource, UITableViewDelegate, UITextViewDelegate {

    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var subtotalLabel: UILabel!
    
    @IBOutlet weak var subtotalTitleLabel: UILabel!
    @IBOutlet weak var checkoutButton: UIButton!
    
    @IBOutlet weak var dividerView: UIView!
    @IBOutlet weak var addItemTextView: UITextView!
    private var cartViews = [UIView]()
    private var emptyViews = [UIView]()
    
    // Braintree Integration Constants
    private var activityIndicator: UIActivityIndicatorView!
    private let CLIENT_AUTHORIZATION = "sandbox_9tgty665_ys8wr2wffmztcdqn"

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
        // separator insets
        tableView.tableFooterView = UIView()
//        tableView.separatorStyle = .none
//        tableView.backgroundColor = UIColor(red: 251/255, green: 251/255, blue: 251/255, alpha: 1)
        addItemTextView.delegate = self
        tableView.separatorColor = UIColor(red: 240/255, green: 240/255, blue: 240/255, alpha: 1)
        
        // format checkout button
        checkoutButton.layer.cornerRadius = 5
        
        // make appropriate things hidden
        cartViews = [subtotalLabel, subtotalTitleLabel, checkoutButton, dividerView]
        emptyViews = [readyLabel]
        
        // Add the activity indicator for payments
        activityIndicator = Utilities.addActivityIndicator(to: view)
        
        // Start fetching the client token if none is set. This is done in the background.
        if User.currentUser?.braintreeToken == nil {
            User.currentUser?.fetchClientToken(completion: nil)
        }
    }

    func addProduct() {
        let product = Product(dictionary: ["name": addItemTextView.text], api: apiType.manual)
        products = products + [product]
        tableView.reloadData()
        addItemTextView.text = "Tap the camera to scan"
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
        if indexPath.row < products.count {
            cell.preservesSuperviewLayoutMargins = false
            let inset = cell.productImage.frame.origin.x + cell.productImage.frame.size.width + CGFloat(10)
            cell.separatorInset = UIEdgeInsets.zero
            cell.layoutMargins = UIEdgeInsets.zero
//            cell.separatorInset = UIEdgeInsets.init(top: 0.0, left: inset, bottom: 0.0, right: 0.0)
//            cell.layoutMargins = UIEdgeInsets.init(top: 0.0, left: inset, bottom: 0.0, right: 0.0)
        }
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        // deselect the cell and get relevant product
        tableView.deselectRow(at: indexPath, animated: true)
        let product = products[indexPath.row]
        
        // prepare for segue
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
       
        // check if user inputted
        if product.upc == nil {
            tabBarController?.switchTo(tab: .scanner)
        }
        
        
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
        tabBarController?.switchTo(tab: .scanner)
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
        
        if let token = User.currentUser!.braintreeToken {
            showDropIn(clientTokenOrTokenizationKey: token)
        } else {
            activityIndicator.startAnimating()
            User.currentUser!.fetchClientToken(completion: { (token: String?) in
                self.activityIndicator.stopAnimating()
                guard let token = token else {
                    Utilities.presentErrorAlert(title: "Payment Error", message: "Unable to retrieve payment token!")
                    return
                }
                self.showDropIn(clientTokenOrTokenizationKey: token)
            })
        }
    }
    
    /** MARK - Braintree Payments */
    private func paymentFailure(controller: UIViewController, msg: String) {
        controller.dismiss(animated: true, completion: {
            Utilities.presentErrorAlert(title: "Payment Error", message: msg)
        })
    }
    func showDropIn(clientTokenOrTokenizationKey: String) {
        let request =  BTDropInRequest()
        let dropIn = BTDropInController(authorization: clientTokenOrTokenizationKey, request: request)
        { (controller, result, error) in
            guard error == nil else { return self.paymentFailure(controller: controller, msg: error.debugDescription)}
            guard result?.isCancelled != true else {
                // User cancelled, do nothing but dismiss.
                controller.dismiss(animated: true, completion: nil)
                return
            }
            guard let result = result else { return self.paymentFailure(controller: controller, msg: "Invalid Inputs")}
            guard let nonce = result.paymentMethod?.nonce else { return self.paymentFailure(controller: controller, msg: "Nonce value invalid") }
            
            // Success!
            self.postNonceToServer(paymentMethodNonce: nonce)
            controller.dismiss(animated: true, completion: nil)
        }
        guard let view = dropIn else { return Utilities.presentErrorAlert(title: "Failure", message: "Could not present payment options") }
        
        self.present(view, animated: true, completion: nil)
    }

    private func postNonceToServer(paymentMethodNonce: String) {
        let fakePaymentMethodNonce = "fake-valid-nonce"
        guard let paymentAmount = User.currentUser?.current.total else { return }
        print("$\(paymentAmount)")
        print("posting to server")
        let paymentURL = URL(string: "\(Constants.paymentServerURL)/checkout")!
        var request: URLRequest = URLRequest(url: paymentURL)
        let data = "payment_method_nonce=\(fakePaymentMethodNonce)&amount=\(paymentAmount)"
        request.httpBody = data.data(using: String.Encoding.utf8)
        request.httpMethod = "POST"
        
        activityIndicator.startAnimating()
        URLSession.shared.dataTask(with: request, completionHandler: {[unowned self] (data, response, error) -> Void in
            // if (error != nil) {
            self.activityIndicator.stopAnimating()
            if let user = User.currentUser {
                self.completePayment(user: user)
            }
        }).resume()
    }
    private func completePayment(user: User) {
        let receipt = user.current
        receipt.paid = true
        receipt.completed = Date()
        user.completeCheckout()
        Utilities.presentSuccessAlert(title: "Nice\n", message: "\nYou're done with checkout.\n", button: "My History", action: {
            self.tabBarController?.switchTo(listTab: .history)
        })
    }
}
