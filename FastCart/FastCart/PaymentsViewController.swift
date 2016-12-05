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
    func createAlert() {
        // Complete the receipt.
//        let appearance = SCLAlertView.SCLAppearance(
//            kCircleIconHeight: 40.0,
//            showCloseButton: false
//            
//        )
        let appearance = SCLAlertView.SCLAppearance(
            kCircleIconHeight: 40.0,
            showCloseButton: true
            
        )
        let alertView = SCLAlertView(appearance: appearance)
//        alertView.addButton("My Receipt", target:self, selector:#selector(PaymentsViewController.showReceipt))
        let alertViewIcon = #imageLiteral(resourceName: "fastcartIcon")
        alertView.showTitle(
            "Oops!\n",
            subTitle: "\nWe're still in beta. We'll let you know as soon as its ready.\n",
            duration: 0.0,
            completeText: "Done",
            style: .success,
            colorStyle: 0x72BEB7,
            colorTextButton: 0xFFFFFF,
            circleIconImage: alertViewIcon
        )
//        alertView.showTitle(
//            "Nice!\n",
//            subTitle: "\nYou're done with checkout.\n",
//            duration: 0.0,
//            completeText: "See My Receipt",
//            style: .success,
//            colorStyle: 0x72BEB7,
//            colorTextButton: 0xFFFFFF,
//            circleIconImage: alertViewIcon
//        )
    }
    func showReceipt() {
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let vc = storyboard.instantiateViewController(withIdentifier: "TabViewController") as! TabViewController
        vc.selectedIndex = 0
        self.navigationController?.pushViewController(vc, animated: true)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(true)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
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
    
    private func setUpBraintree() {
        self.activityIndicator.startAnimating()
        self.setUpPayments()
    }
    
    private func setUpView() {
        self.activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .gray)
        self.activityIndicator.center = self.view.center;
        // self.view.autoresizesSubviews = true
        self.view.addSubview(self.activityIndicator)
    }
    // Only call after the view is ready to display or re-display.
    private func modifyViewOnAppearance() {
        // Change constraints if we can't checkout so payments take-up entire screen.
        if !self.canCheckout {
            self.infoView.isHidden = true
            if self.paymentTopConstraint.isActive {
                NSLayoutConstraint.deactivate([self.paymentTopConstraint])
            }
            if self.paymentTopTotalConstraint == nil || !self.paymentTopTotalConstraint!.isActive{
                paymentTopTotalConstraint = NSLayoutConstraint(item: self.paymentView, attribute: .top, relatedBy: .equal, toItem: self.view, attribute: .top, multiplier: 1, constant: 0)
                NSLayoutConstraint.activate([self.paymentTopTotalConstraint!])
            }
        } else {
            self.infoView.isHidden = false
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
        guard let dropInViewController = dropInViewController else { return }
        dropInViewController.delegate = self
        dropInViewController.view.tintColor = Constants.themeColor
        dropInViewController.paymentRequest?.shouldHideCallToAction = !canCheckout
        dropInViewController.fetchPaymentMethods(onCompletion: {
            self.moveDropIn(dropInViewController)
            self.activityIndicator.stopAnimating()
        })
    }

    private func postNonceToServer(paymentMethodNonce: String) {
        self.createAlert()
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
        
        
        let receipt = user.current
        receipt.paid = true
        receipt.completed = Date()
        user.completeCheckout()
        
    }
}
