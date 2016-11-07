//
//  MBTBarcodeScanner.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/7/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import Foundation

import UIKit
import MTBBarcodeScanner
import AVFoundation

class MTBViewController: UIViewController {
    
    var scanner: MTBBarcodeScanner?
    
    /*
     [MTBBarcodeScanner requestCameraPermissionWithSuccess:^(BOOL success) { if (success) { NSError *error = nil
     self.scanner.startScanningWithResultBlock(^(NSArray,*codes),{,AVMetadataMachineReadableCodeObject,*code,=,[codes,firstObject)
     NSLog("Found code: %@",code.stringValue)
     self.scanner.stopScanning()
     } error:&error]
     } else { // The user denied access to the camera
     } }]
     */
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        // check to see if camera usage is authorized
        if AVCaptureDevice.authorizationStatus(forMediaType: AVMediaTypeVideo) ==  AVAuthorizationStatus.authorized
        {
            // Already Authorized
            startScanning()
            print("getting here")
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
        scanner = MTBBarcodeScanner(previewView: self.view)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        scanner?.startScanning(resultBlock: { (codes) in
            if codes != nil {
                print("getting foxy")
                for code in codes! {
                    print(code)
                }
                
                self.scanner?.stopScanning()
            }
        }, error: nil)
        
    }
    
    
}

