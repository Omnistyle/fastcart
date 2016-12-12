//
//  PaymentsViewController.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import Braintree
import SCLAlertView

class PaymentsViewController: UIViewController, BTDropInViewControllerDelegate {
    
    @IBOutlet weak var subTotalLabel: UILabel!
    @IBOutlet weak var taxesLabel: UILabel!
    @IBOutlet weak var totalLabel: UILabel!
    
    @IBOutlet weak var storeLabel: UILabel!
    @IBOutlet weak var storeLocationLabel: UILabel!
    @IBOutlet weak var storeImage: UIImageView!
    
    @IBOutlet weak var infoView: UIView!
    @IBOutlet weak var paymentView: UIView!
    
    private var paymentServerURL: String = "https://fastcart-braintree.herokuapp.com"
    private var activityIndicator: UIActivityIndicatorView!
    private var dropInViewController: BTDropInViewController?
    
    var braintreeClient: BTAPIClient!
    let CLIENT_AUTHORIZATION = "sandbox_9tgty665_ys8wr2wffmztcdqn"
    
    private var canCheckout = false
    private var minimumRequiredForCheckout = 0.0
    
    @IBOutlet var paymentTopConstraint: NSLayoutConstraint!
    private var paymentTopTotalConstraint: NSLayoutConstraint?
    
    override func viewDidLoad() {
        super.viewDidLoad()
    
        self.setPaymentInformation()
        self.setUpView()
        self.setUpBraintree()
        
        storeImage.layer.cornerRadius = storeImage.frame.size.width / 2
        storeImage.layer.masksToBounds = true
        storeImage.layer.borderColor = UIColor.lightGray.cgColor
        storeImage.layer.borderWidth = 1
        
    }
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
    
        // We don't hide the view controller under the bar, so we set the UIColor
        // to white.
        self.navigationController?.navigationBar.barTintColor = UIColor.white
        self.navigationController?.navigationBar.isOpaque = false
        
        self.setPaymentInformation()
        self.modifyViewOnAppearance()
    }
    private func moveDropIn(_ dropInViewController: BTDropInViewController){
        // Fix some parameter issues, like bounds and scrolling.
        dropInViewController.view.frame = self.paymentView.bounds
        for view in dropInViewController.view.subviews {
            if let scrollView = view as? UIScrollView {
                scrollView.bounces = false
                scrollView.isScrollEnabled = false
            }
        }
        
        // Move it in!
        self.paymentView.addSubview(dropInViewController.view)
        self.addChildViewController(dropInViewController)
        dropInViewController.didMove(toParentViewController: self)
    }

    func showReceipt() {
        self.tabBarController?.switchTo(listTab: .receipt)
    }
    
    /* MARK - BTDropInViewControllerDelegate Methods */
    public func drop(_ viewController: BTDropInViewController, didSucceedWithTokenization paymentMethodNonce: BTPaymentMethodNonce) {
        // Send payment method nonce to your server for processing
        postNonceToServer(paymentMethodNonce: paymentMethodNonce.nonce)
    }
    
    public func drop(inViewControllerDidCancel viewController: BTDropInViewController) {
    }
    /* END MARK - BTDropInViewControllerDelegate Methods */
    
    private func setUpBraintree() {
        self.activityIndicator.startAnimating()
        self.setUpPayments()
    }
    
    private func setUpView() {
        activityIndicator = Utilities.addActivityIndicator(to: self.view)
    }
    
    // Only call after the view is ready to display or re-display.
    private func modifyViewOnAppearance() {
        // Change constraints if we can't checkout so payments take-up entire screen.
        if !self.canCheckout {
            self.infoView.isHidden = true
            let paymentRequest = BTPaymentRequest()
            paymentRequest.shouldHideCallToAction = true
            self.dropInViewController?.paymentRequest = paymentRequest
            if self.paymentTopConstraint.isActive {
                NSLayoutConstraint.deactivate([self.paymentTopConstraint])
            }
            if self.paymentTopTotalConstraint == nil || !self.paymentTopTotalConstraint!.isActive{
                paymentTopTotalConstraint = NSLayoutConstraint(item: self.paymentView, attribute: .top, relatedBy: .equal, toItem: self.view, attribute: .top, multiplier: 1, constant: 0)
                NSLayoutConstraint.activate([self.paymentTopTotalConstraint!])
            }
        } else {
            self.infoView.isHidden = false
            let paymentRequest = BTPaymentRequest()
            paymentRequest.shouldHideCallToAction = false
            self.dropInViewController?.paymentRequest = paymentRequest
            if self.paymentTopTotalConstraint != nil && self.paymentTopTotalConstraint!.isActive {
                NSLayoutConstraint.deactivate([self.paymentTopTotalConstraint!])
            }
            if !self.paymentTopConstraint.isActive {
                NSLayoutConstraint.activate([self.paymentTopConstraint])
            }
        }
        dropInViewController?.paymentRequest?.shouldHideCallToAction = !canCheckout
        self.view.layoutIfNeeded()
    }
    
    private func setUpPayments() {
        let userId: String = User.currentUser!.id;
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
    
    // Returns whether or not the view will display receipt information at the top.
    private func setPaymentInformation() {
        let store = Store.currentStore
        storeLabel.text = store.name
        storeLocationLabel.text = store.locationAsString
        store.setStoreImage(view: storeImage)
        if let receipt = User.currentUser?.current {
            subTotalLabel.text = receipt.subTotalAsString
            totalLabel.text = receipt.totalAsString
            taxesLabel.text = receipt.taxAsString
            canCheckout =  receipt.subTotal > minimumRequiredForCheckout
        }
    }
    
    private func paymentStarted(_ client: BTAPIClient) {
        // Create a BTDropInViewController
        self.dropInViewController = BTDropInViewController(apiClient: client)
        dropInViewController?.delegate = self
        dropInViewController?.paymentRequest?.shouldHideCallToAction = !canCheckout
        dropInViewController?.fetchPaymentMethods(onCompletion: {
            if let dropInViewController = self.dropInViewController {
                self.moveDropIn(dropInViewController)
                self.activityIndicator.stopAnimating()
            }
        })
        dropInViewController?.view.tintColor = Constants.themeColor
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
        
        activityIndicator.startAnimating()
        URLSession.shared.dataTask(with: request, completionHandler: {[unowned self] (data, response, error) -> Void in
            // if (error != nil) {
            self.activityIndicator.stopAnimating()
            if let user = User.currentUser {
                self.completePayment(user: user)
            }
            //}
        }).resume()
        
    }
    
    private func completePayment(user: User) {
        let receipt = user.current
        receipt.paid = true
        receipt.completed = Date()
        user.completeCheckout()
        Utilities.presentSuccessAlert(title: "Nice\n", message: "\nYou're done with checkout.\n", button: "My Receipt", action: {
            self.showReceipt()
        })
    }
}
