//
//  SearchUpcClient.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/15/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class UPCClient {
    static let sharedInstance = UPCClient.init()
    // Configure to handle completion in main thread.
    private let session = URLSession(
        configuration: URLSessionConfiguration.default,
        delegate:nil,
        delegateQueue:OperationQueue.main
    )
    func getOffers(upc: String, success: @escaping ([Offer]) -> (), failure: @escaping (Error) -> ()){
        guard let url = URL(string: "https://api.upcitemdb.com/prod/trial/lookup?upc=\(upc)") else { return }
        
        let request = URLRequest(url: url)
        let task : URLSessionDataTask = session.dataTask(with: request, completionHandler: { (data, response, error) in
            guard error == nil else { return failure(error!) }
            let genericError: Error = NSError(domain: "Generic Internal", code: 1, userInfo: [:])
            guard let data = data else { return failure(genericError) }
            guard let responseDictionary = try! JSONSerialization.jsonObject(with: data, options: []) as? NSDictionary else { return failure(genericError)}
            guard let code = responseDictionary["code"] as? String else { return failure(genericError) }
            guard code == "OK" else { return failure(genericError) }
            guard let numItems = responseDictionary["total"] as? Int else { return failure(genericError)}
            guard numItems > 0 else { return success([]) }
            guard let items = responseDictionary["items"] as? [NSDictionary] else { return failure(genericError) }
            success(Offer.offers(from: items))
        })
        
        task.resume()
    }

}

