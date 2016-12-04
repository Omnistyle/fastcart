//
//  ViewController.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/7/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import AVFoundation
import BarcodeScanner

class ScanViewController: UIViewController, BarcodeScannerCodeDelegate {
    var product: Product?
    
    private var scanController: BarcodeScannerController!
    
    override func viewDidLoad() {
        scanController = createScanner()
        // If camera is available, push the scanner. Otherwise display default.
        if UIImagePickerController.isSourceTypeAvailable(.camera) {
            self.navigationController?.pushViewController(scanController, animated: true)
        }
    }
    
    @IBAction func onFakeScanButtonPress(_ sender: Any) {
        self.processCode(nil, didCaptureCode: "787651241531", type: "upc")
    }
    
    /** Mark - BarcodeScannerCodeDelegate */
    func barcodeScanner(_ controller: BarcodeScannerController, didCaptureCode code: String, type: String) {
        self.processCode(controller, didCaptureCode: code, type: type)
    }
   
    // Creates the controller for scanning purposes.
    private func createScanner() -> BarcodeScannerController {
        let controller = BarcodeScannerController()
        controller.codeDelegate = self
        controller.errorDelegate = self
        controller.dismissalDelegate = self
        
        return controller
    }
    // Process the captured code. Abstracted out so we can re-use even when testing.
    // If the controller is nil, we don't do anything to it.
    private func processCode(_ controller: BarcodeScannerController?, didCaptureCode code: String, type: String) {
        // perform network request
        WalmartClient.sharedInstance.getProductWithUPC(upc: code, success: { (products: [Product]) in
            guard products.count > 0 else {
                Utilities.presentErrorAlert(title: "No Products", message: "Could not find product for code \(code).")
                return
            }
            
            // Present product modally.
            let storyboard = UIStoryboard(name: "Main", bundle: nil)
            let productDetailsViewController = storyboard.instantiateViewController(withIdentifier: "ProductDetailsWithScrollViewController") as! ProductDetailsViewController
            
            productDetailsViewController.product = products[0]
            self.present(productDetailsViewController, animated: true, completion: {
                controller?.reset()
            })
            
        }, failure: {(error: Error) -> () in
            controller?.resetWithError(message: "UPC: \(code) not found!")
        })
    }
}

extension ScanViewController: BarcodeScannerErrorDelegate {
    
    func barcodeScanner(_ controller: BarcodeScannerController, didReceiveError error: Error) {
        controller.resetWithError(message: error.localizedDescription)
    }
}

extension ScanViewController: BarcodeScannerDismissalDelegate {
    
    func barcodeScannerDidDismiss(_ controller: BarcodeScannerController) {
        controller.dismiss(animated: true, completion: nil)
    }
}

