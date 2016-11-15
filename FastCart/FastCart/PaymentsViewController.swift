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
    /// Informs the delegate when the user has successfully provided payment info that has been
    /// successfully tokenized.
    ///
    /// Upon receiving this message, you should dismiss Drop In.
    ///
    /// @param viewController The Drop In view controller informing its delegate of success
    /// @param tokenization The selected (and possibly newly created) tokenized payment information.
    var braintreeClient: BTAPIClient?
    let CLIENT_AUTHORIZATION = "sandbox_9tgty665_ys8wr2wffmztcdqn"
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        setUpPayments()
    }
    
//    override func viewWillAppear(_ animated: Bool) {
////        super.viewWillAppear(true)
//        setUpPayments()
//    }
//    
    func setUpPayments() {
        let clientTokenURL = URL(string: "https://fastcart-braintree.herokuapp.com/client_token")!
        var clientTokenRequest = URLRequest(url: clientTokenURL)
        clientTokenRequest.setValue("text/plain", forHTTPHeaderField: "Accept")
        
        URLSession.shared.dataTask(with: clientTokenRequest as URLRequest) { (data, response, error) -> Void in
            // TODO: Handle errors
            let clientToken = String(data: data!, encoding: String.Encoding.utf8)
            
            self.braintreeClient = BTAPIClient(authorization: clientToken!)
            // As an example, you may wish to present our Drop-in UI at this point.
            // Continue to the next section to learn more...
            }.resume()
        
        paymentStarted()
    }

    func paymentStarted() {
        // Create a BTDropInViewController
        let dropInViewController = BTDropInViewController(apiClient: braintreeClient!)
        dropInViewController.delegate = self

        // This is where you might want to customize your view controller (see below)

        // The way you present your BTDropInViewController instance is up to you.
        // In this example, we wrap it in a new, modally-presented navigation controller:
        dropInViewController.navigationItem.leftBarButtonItem = UIBarButtonItem(
        barButtonSystemItem: UIBarButtonSystemItem.cancel,
        target: self, action: #selector(self.userDidCancelPayment))
        let navigationController = UINavigationController(rootViewController: dropInViewController)
        present(navigationController, animated: true, completion: nil)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    public func drop(_ viewController: BTDropInViewController, didSucceedWithTokenization paymentMethodNonce: BTPaymentMethodNonce) {
        // Send payment method nonce to your server for processing
//        postNonceToServer(paymentMethodNonce: paymentMethodNonce.nonce)

        self.tabBarController?.selectedIndex = 2
        dismiss(animated: true, completion: nil)
    }

    func postNonceToServer(paymentMethodNonce: String) {
        let fakePaymentMethodNonce = "fake-valid-nonce"
        print("posting to server")
        let paymentURL = URL(string: "fastcart-braintree.herokuapp.com/client_token/checkout")!
        let request = NSMutableURLRequest(url: paymentURL)
        request.httpBody = "payment_method_nonce=\(fakePaymentMethodNonce)".data(using: String.Encoding.utf8)
        request.httpMethod = "POST"
        
        URLSession.shared.dataTask(with: request as URLRequest) { (data, response, error) -> Void in
            // TODO: Handle success or failure
        }.resume()
    }
    
    func drop(inViewControllerDidCancel viewController: BTDropInViewController) {
        dismiss(animated: true, completion: nil)
    }
    
    func userDidCancelPayment() {
        dismiss(animated: true, completion: nil)
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
