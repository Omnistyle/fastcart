//
//  ViewController.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/7/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import MTBBarcodeScanner
import AVFoundation
import BarcodeScanner

extension ScanViewController: BarcodeScannerCodeDelegate {
    func barcodeScanner(_ controller: BarcodeScannerController, didCaptureCode code: String, type: String) {
        print(code)
        // perform network request
        WalmartClient.sharedInstance.getProductWithUPC(upc: code, success: { (products: [Product]) in
            // save product and present correct view
            let storyboard = UIStoryboard(name: "Main", bundle: nil)
            
            // try this
            let productDetailsNavigationController = storyboard.instantiateViewController(withIdentifier: "ProductDetailsNavigationController") as! UINavigationController
            let productDetailsViewController = productDetailsNavigationController.topViewController as! ProductDetailsViewController
            productDetailsViewController.product = products[0]
            print("product\(products)")
            self.present(productDetailsNavigationController, animated: true, completion: nil)
            
        }, failure: {(error: Error) -> () in
            print(error.localizedDescription)
        })

        // dismiss after to test
        controller.dismiss(animated: true, completion: nil)
        // controller.reset()
        
    }
}

extension ScanViewController: BarcodeScannerErrorDelegate {
    
    func barcodeScanner(_ controller: BarcodeScannerController, didReceiveError error: Error) {
        print(error)
    }
}

extension ScanViewController: BarcodeScannerDismissalDelegate {
    
    func barcodeScannerDidDismiss(_ controller: BarcodeScannerController) {
        controller.dismiss(animated: true, completion: nil)
    }
}

class ScanViewController: UIViewController {
    var product: Product?
    
    
    @IBAction func onFakeScanButtonPress(_ sender: Any) {
        let code = "787651241531"
        WalmartClient.sharedInstance.getProductWithUPC(upc: code, success: { (products: [Product]) in
            // save product and present correct view
            let storyboard = UIStoryboard(name: "Main", bundle: nil)
            
            // try this
            let productDetailsNavigationController = storyboard.instantiateViewController(withIdentifier: "ProductDetailsNavigationController") as! UINavigationController
            let productDetailsViewController = productDetailsNavigationController.topViewController as! ProductDetailsViewController
            productDetailsViewController.product = products[0]
            print("product\(products)")
            self.present(productDetailsNavigationController, animated: true, completion: nil)
            
        }, failure: {(error: Error) -> () in
            print(error.localizedDescription)
        })
    
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        print("loaded")
        // Do any additional setup after loading the view, typically from a nib.
        
        
    }
    @IBOutlet weak var scanButton: UIButton!
    
    @IBAction func onScanButtonPress(_ sender: Any) {
        // check to see if camera usage is authorized
        print("scanning")
        if AVCaptureDevice.authorizationStatus(forMediaType: AVMediaTypeVideo) ==  AVAuthorizationStatus.authorized
        {
            // Already Authorized
            startScanning()
        }
        else
        {
            AVCaptureDevice.requestAccess(forMediaType: AVMediaTypeVideo, completionHandler: { (granted :Bool) -> Void in
                if granted == true
                {
                    // User granted
                    self.startScanning()
                }
                else
                {
                    // User Rejected
                    
                }
            });
        }
    }
    
    func startScanning() {
        let controller = BarcodeScannerController()
        controller.codeDelegate = self
        controller.errorDelegate = self
        controller.dismissalDelegate = self
        
        present(controller, animated: true, completion: nil)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
        
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
    }


}

