//
//  PaymentsViewController.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import Braintree

class PaymentsViewController: UIViewController, BTDropInViewControllerDelegate {
    
    @IBOutlet weak var subTotalLabel: UILabel!
    @IBOutlet weak var taxesLabel: UILabel!
    @IBOutlet weak var totalLabel: UILabel!
    
    @IBOutlet weak var storeLabel: UILabel!
    @IBOutlet weak var storeLocationLabel: UILabel!
    @IBOutlet weak var storeImage: UIImageView!
    
    @IBOutlet var actionButtons: [UIButton]!
    
    private var paymentServerURL: String = "https://fastcart-braintree.herokuapp.com"
    private var activityIndicator: UIActivityIndicatorView!
    
    var braintreeClient: BTAPIClient!
    let CLIENT_AUTHORIZATION = "sandbox_9tgty665_ys8wr2wffmztcdqn"
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.setUpView()
        self.setPaymentInformation()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(true)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func onPay(_ sender: UIButton) {
        self.activityIndicator.startAnimating()
        self.setUpPayments()
    }

    @IBAction func onAddPayment(_ sender: UIButton) {
        self.performSegue(withIdentifier: "pushAddPayment", sender: self)
    }
    
    
    /* MARK - BTDropInViewControllerDelegate Methods */
    public func drop(_ viewController: BTDropInViewController, didSucceedWithTokenization paymentMethodNonce: BTPaymentMethodNonce) {
        // Send payment method nonce to your server for processing
        postNonceToServer(paymentMethodNonce: paymentMethodNonce.nonce)
        
        dismiss(animated: true, completion: {[unowned self] in
            self.tabBarController?.selectedIndex = 2
        })
    }
    
    public func drop(inViewControllerDidCancel viewController: BTDropInViewController) {
        let _ = self.navigationController?.popViewController(animated: true)
    }
    /* END MARK - BTDropInViewControllerDelegate Methods */
    
    private func userActionStarted() {
        for button in self.actionButtons {
            button.isUserInteractionEnabled = false
        }
    }
    private func userActionEnded() {
        for button in self.actionButtons {
            button.isUserInteractionEnabled = true
        }
    }
    
    private func setUpView() {
        self.activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .gray)
        self.activityIndicator.center = self.view.center;
        self.view.addSubview(self.activityIndicator)
    }
    private func setUpPayments() {
        let userId = User.currentUser!.id;
        let clientTokenURL = URL(string: "\(self.paymentServerURL)/client_token/\(userId)")!
        var clientTokenRequest = URLRequest(url: clientTokenURL)
        clientTokenRequest.setValue("text/plain", forHTTPHeaderField: "Accept")
        
        URLSession.shared.dataTask(with: clientTokenRequest, completionHandler: {[unowned self] (data, response, error) -> Void in
            guard let data = data else { return }
            guard let clientToken = String(data: data, encoding: String.Encoding.utf8) else { return }
            self.braintreeClient = BTAPIClient(authorization: clientToken)
            
            self.paymentStarted(self.braintreeClient)
        }).resume()
    }
    
    private func setPaymentInformation() {
        if let receipt = User.currentUser?.current {
            subTotalLabel.text = receipt.subTotalAsString
            totalLabel.text = receipt.totalAsString
            taxesLabel.text = receipt.taxAsString
        }
        if let store = Store.currentStore {
            storeLabel.text = store.name
            storeLocationLabel.text = store.locationAsString
            store.setStoreImage(view: storeImage)
        }
    }
    
    private func paymentStarted(_ client: BTAPIClient) {
        // Create a BTDropInViewController
        let dropInViewController = BTDropInViewController(apiClient: client)
        
        dropInViewController.delegate = self
        
        self.activityIndicator.stopAnimating()
        self.navigationController?.pushViewController(dropInViewController, animated: true)
    }

    private func postNonceToServer(paymentMethodNonce: String) {
        let fakePaymentMethodNonce = "fake-valid-nonce"
        guard let paymentAmount = User.currentUser?.current.total else { return }
        print("$\(paymentAmount)")
        print("posting to server")
        let paymentURL = URL(string: "\(self.paymentServerURL)/checkout")!
        var request: URLRequest = URLRequest(url: paymentURL)
        let data = "payment_method_nonce=\(fakePaymentMethodNonce)&amount=\(paymentAmount)"
        request.httpBody = data.data(using: String.Encoding.utf8)
        request.httpMethod = "POST"
        
        URLSession.shared.dataTask(with: request, completionHandler: {[unowned self] (data, response, error) -> Void in
            // if (error != nil) {
                if let user = User.currentUser {
                    self.completePayment(user: user)
                }
            //}
        }).resume()
    }
    
    private func completePayment(user: User) {
        user.current.paid = true
        user.current.completed = Date()
        user.history.append(user.current)
        user.current = Receipt()
    }
}
