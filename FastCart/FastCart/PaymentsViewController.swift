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
    
    @IBOutlet weak var paymentView: UIView!
    
    private var paymentServerURL: String = "https://fastcart-braintree.herokuapp.com"
    private var activityIndicator: UIActivityIndicatorView!
    
    var braintreeClient: BTAPIClient!
    let CLIENT_AUTHORIZATION = "sandbox_9tgty665_ys8wr2wffmztcdqn"
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.setUpView()
        self.setPaymentInformation()
        self.setUpBraintree()
        
        storeImage.layer.cornerRadius = storeImage.frame.size.width / 2
        storeImage.layer.masksToBounds = true
        storeImage.layer.borderColor = UIColor.lightGray.cgColor
        storeImage.layer.borderWidth = 1
        
    }
    func createAlert() {
        // Complete the receipt.
        let appearance = SCLAlertView.SCLAppearance(
            kCircleIconHeight: 40.0,
            showCloseButton: false
            
        )
        //        let alertView = SCLAlertView(appearance: appearance)
        //        alertView.title = "Nice!"
        //        alertVie
        let alertView = SCLAlertView(appearance: appearance)
        alertView.addButton("My Receipt", target:self, selector:Selector("showReceipt"))
        let alertViewIcon = #imageLiteral(resourceName: "fastcartIcon")
        //        alertView.showInfo("Nice!\n", subTitle: "This is a nice alert with a custom icon you choose", circleIconImage: alertViewIcon)
        alertView.showTitle(
            "Nice!\n", // Title of view
            subTitle: "\nYou're done with checkout.\n", // String of view
            duration: 0.0, // Duration to show before closing automatically, default: 0.0
            completeText: "See My Receipt", // Optional button value, default: ""
            style: .success, // Styles - see below.
            colorStyle: 0x72BEB7,
            colorTextButton: 0xFFFFFF,
            circleIconImage: alertViewIcon
        )
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
        self.view.autoresizesSubviews = true
        self.view.addSubview(self.activityIndicator)
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
    
    private func setPaymentInformation() {
        if let receipt = User.currentUser?.current {
            subTotalLabel.text = receipt.subTotalAsString
            totalLabel.text = receipt.totalAsString
            taxesLabel.text = receipt.taxAsString
        }
        let store = Store.currentStore
        storeLabel.text = store.name
        storeLocationLabel.text = store.locationAsString
        store.setStoreImage(view: storeImage)
    }
    
    private func paymentStarted(_ client: BTAPIClient) {
        // Create a BTDropInViewController
        let dropInViewController = BTDropInViewController(apiClient: client)
        dropInViewController.delegate = self
        dropInViewController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        dropInViewController.view.tintColor = UIColor(red: 114.0/255, green: 190.0/255, blue: 183.0/255, alpha: 1)
        dropInViewController.view.frame = self.paymentView.bounds
        dropInViewController.fetchPaymentMethods(onCompletion: {
            dropInViewController.view.frame = self.paymentView.bounds;
            self.paymentView.addSubview(dropInViewController.view)
            self.addChildViewController(dropInViewController)
            dropInViewController.didMove(toParentViewController: self)
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
