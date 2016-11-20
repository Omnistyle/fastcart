//
//  SearchUpcClient.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/15/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class SearchUpcClient: UIView {

    /*
    // Only override draw() if you perform custom drawing.
    // An empty implementation adversely affects performance during animation.
    override func draw(_ rect: CGRect) {
        // Drawing code
    }
    */
    let accessToken = "858423AF-7D15-4F94-B08E-148D9326BD22"
    static let sharedInstance : WalmartClient = WalmartClient.init()
    func getProductWithUPC(upc: String, success: @escaping ([Product]) -> (), failure: @escaping (Error) -> ()) {
        // http://api.walmartlabs.com/v1/items?apiKey=69sak8n5jctvbapcs8wp88tt&upc=035000521019
        

        
        // request
        guard let url = URL(string: "http://www.searchupc.com/handlers/upcsearch.ashx?request_type=3&access_token=\(self.accessToken)&upc=\(upc)") else {return}
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
                    let products = Product.productsWithArray(dictionaries: productsDictionary, api: apiType.upc)
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
