//
//  WalmartClient.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/7/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class WalmartClient {
    let apiKey = "69sak8n5jctvbapcs8wp88tt"
    let EAN_LENGTH = 13
    static let sharedInstance : WalmartClient = WalmartClient.init()
    func getProductWithUPC(upc: String, success: @escaping ([Product]) -> (), failure: @escaping (Error) -> ()) {
        // http://api.walmartlabs.com/v1/items?apiKey=69sak8n5jctvbapcs8wp88tt&upc=035000521019
        
        var upc = upc
        // need to handle barcode types to categorize
        // for barcode type : Barcode (EAN-13) with 0 in front, convert to UPC by getting rid of the zero
        if upc.characters.count == EAN_LENGTH {
            // take out the country code (the first character)
            upc.remove(at: upc.startIndex)
        }
        
        // request
        guard let url = URL(string:"http://api.walmartlabs.com/v1/items?apiKey=\(self.apiKey)&upc=\(upc)") else {return}
        let request = URLRequest(url: url)
        print(url)
        
        // Configure session so that completion handler is executed on main UI thread
        let session = URLSession(
            configuration: URLSessionConfiguration.default,
            delegate:nil,
            delegateQueue:OperationQueue.main
        )
        
        let task : URLSessionDataTask = session.dataTask(with: request, completionHandler: { (data, response, error) in
            // ... Remainder of response handling code ...
            if let data = data {
                if let responseDictionary = try! JSONSerialization.jsonObject(with: data, options: []) as? NSDictionary {
                    guard let productsDictionary = responseDictionary["items"] as? [NSDictionary] else {return}
                    let products = Product.productsWithArray(dictionaries: productsDictionary)
                    success(products)
                }
            }
            else if error != nil {
                failure(error!)
            }
        });
        task.resume()
    }
}
