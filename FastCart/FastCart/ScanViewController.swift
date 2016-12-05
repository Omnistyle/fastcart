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
    
    @IBOutlet weak var fakeScanButton: UIButton!

    var product: Product?
    private var scanController: BarcodeScannerController!
    
    override func viewDidLoad() {
        // On first launch, hide with no animation!
        self.navigationController?.setNavigationBarHidden(true, animated: false)
        scanController = createScanner()
        // If camera is available, push the scanner. Otherwise display default.
        if UIImagePickerController.isSourceTypeAvailable(.camera) {
            self.navigationController?.pushViewController(scanController, animated: true)
        }
    }
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        self.navigationController?.setNavigationBarHidden(true, animated: false)
        fakeScanButton.isEnabled = true
    }
    
    @IBAction func onFakeScanButtonPress(_ sender: UIButton) {
        fakeScanButton.isEnabled = false
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
            let productDetailsViewController = storyboard.instantiateViewController(withIdentifier: "ProductDetailsViewController") as! ProductDetailsViewController
            productDetailsViewController.hidesBottomBarWhenPushed = true
            productDetailsViewController.product = products[0]
    
            self.navigationController?.pushViewController(productDetailsViewController, animated: true)
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

