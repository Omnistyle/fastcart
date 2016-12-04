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

extension ScanViewController: BarcodeScannerCodeDelegate {
    func barcodeScanner(_ controller: BarcodeScannerController, didCaptureCode code: String, type: String) {
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
                controller.reset()
            })
            
        }, failure: {(error: Error) -> () in
            controller.resetWithError(message: "UPC: \(code) not found!")
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

class ScanViewController: UIViewController {
    var product: Product?
    
    private var scanController: BarcodeScannerController!
    
    @IBAction func onFakeScanButtonPress(_ sender: Any) {
        let code = "787651241531"
        scanController.codeDelegate?.barcodeScanner(scanController, didCaptureCode: code, type: "upc")
    }
   
    // Creates the controller for scanning purposes.
    private func createScanner() -> BarcodeScannerController {
        let controller = BarcodeScannerController()
        controller.codeDelegate = self
        controller.errorDelegate = self
        controller.dismissalDelegate = self
        
        return controller
    }
    
    override func viewDidLoad() {
        scanController = createScanner()
        // If camera is available, push the scanner. Otherwise display default.
        if UIImagePickerController.isSourceTypeAvailable(.camera) {
            self.navigationController?.pushViewController(scanController, animated: true)
        }
    }
}

