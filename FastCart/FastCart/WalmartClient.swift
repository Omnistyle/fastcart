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
    let alternateApikey = ""
    let EAN_LENGTH = 13
    static let sharedInstance : WalmartClient = WalmartClient.init()
    // Configure session so that completion handler is executed on main UI thread
    private let session = URLSession(
        configuration: URLSessionConfiguration.default,
        delegate:nil,
        delegateQueue:OperationQueue.main
    )
    
    func getTrendingSearches(success: @escaping ([String]) -> (), failure: @escaping (Error) -> ()) {
        
        // request
        let urlString = "http://api.walmartlabs.com/v1/trends?format=json&apiKey=\(self.apiKey)"
        guard let url = URL(string: urlString) else { return failure(FastCartError(message: "Not parsable: \(urlString)", kind: .invalidUrl)) }
        let request = URLRequest(url: url)
        let task : URLSessionDataTask = session.dataTask(with: request, completionHandler: { (data, response, error) in
            if let data = data {
                if let responseDictionary = try! JSONSerialization.jsonObject(with: data, options: []) as? NSDictionary {
                    guard let productsDictionary = responseDictionary["items"] as? [NSDictionary] else {return}
                    var names = [String]()
                    for product in productsDictionary {
                        if let name = product["name"] as? String {
                            names.append(name)
                        }
                    }
                    success(names)
                }
            }
            else if error != nil {
                failure(error!)
            }
        });
        task.resume()
        
    }
    
    func getVariantImage(id: String, success: @escaping (URL) -> (), failure: @escaping (Error) -> ()) {
        
        
        // request
        guard let url = URL(string:"http://api.walmartlabs.com/v1/items/\(id)?format=json&apiKey=\(self.apiKey)") else { return }
        
        let request = URLRequest(url: url)
        let task : URLSessionDataTask = session.dataTask(with: request, completionHandler: { (data, response, error) in
        if let data = data {
        if let dictionary = try! JSONSerialization.jsonObject(with: data, options: []) as? NSDictionary {
        
            if let imageString = dictionary["largeImage"] as? String {
                if let imageUrl = URL(string: imageString) {
                    success(imageUrl)
                }
            } else {
                print(dictionary)}
            }
        
        }
        else if error != nil {
            failure(error!)
        }
        
        });
        
        task.resume()
    }

    func getVariantImages(ids: [String], success: @escaping ([URL]) -> (), failure: @escaping (Error) -> ()) {
        var images = [URL]()
        let shortenedIds = ids.prefix(upTo: 2)
        for id in shortenedIds {
            guard let url = URL(string:"http://api.walmartlabs.com/v1/items/\(id)?format=json&apiKey=\(self.apiKey)") else {return}
            let request = URLRequest(url: url)
            let task : URLSessionDataTask = session.dataTask(with: request, completionHandler: { (data, response, error) in
                if let data = data {
                    if let dictionary = try! JSONSerialization.jsonObject(with: data, options: []) as? NSDictionary {
                        
                        if let imageString = dictionary["largeImage"] as? String {
                            if let imageUrl = URL(string: imageString) {
                                images.append(imageUrl)
                            }
                        } else {
                        print(dictionary)
                    }
                    }
                    
                }
                else if error != nil {
                    failure(error!)
                }
                
            });
            
            task.resume()
        }
        success(images)
    }
    func getVariantsByItemId(id: String, success: @escaping ([String]) -> (), failure: @escaping (Error) -> ()) {
        guard let url = URL(string:"http://api.walmartlabs.com/v1/items/\(id)?format=json&apiKey=\(self.apiKey)") else {return}
        let request = URLRequest(url: url)
        let task : URLSessionDataTask = session.dataTask(with: request, completionHandler: { (data, response, error) in
            if let data = data {
                if let responseDictionary = try! JSONSerialization.jsonObject(with: data, options: []) as? NSDictionary {
                    if let variants = responseDictionary["variants"] as? [Int] {
                        var variantStrings = [String]()
                        for variant in variants {
                            let variantString = String(variant)
                            variantStrings.append(variantString)
                        }
                        success(variantStrings)
                    }
                }
            }
            else if error != nil {
                failure(error!)
            }
        });
        task.resume()
        
    }
    
    func getProductsWithSearchTerm(term: String, startIndex: String, price: String? = nil, facets: String? = nil, color: [String]? = [String](), shipping: [String?] = [String](), success: @escaping ([Product]) -> (), failure: @escaping (Error) -> ()) {
        var maxPrice = "500"
        if price != nil {
            maxPrice = price!
        }
        
        // request
        var urlString = "http://api.walmartlabs.com/v1/search?query=\(term)&start=\(startIndex)&format=json&apiKey=\(self.apiKey)&facet=on&facet.range=price:[0%20TO%20\(maxPrice)]"
    
        if color?.isEmpty == false {
            if let colorEl = color?[0] {
                urlString = urlString + "&facet.filter=color:\(colorEl)"
                print("filtered")
                print(urlString)
            }
        }
        
        guard let url = URL(string: urlString) else {return }
        let request = URLRequest(url: url)
        let task : URLSessionDataTask = session.dataTask(with: request, completionHandler: { (data, response, error) in
            if let data = data {
                if let responseDictionary = try! JSONSerialization.jsonObject(with: data, options: []) as? NSDictionary {
                    guard let productsDictionary = responseDictionary["items"] as? [NSDictionary] else {return}
                    let products = Product.productsWithArray(dictionaries: productsDictionary, api: apiType.walmart)
                    success(products)
                }
            }
            else if error != nil {
                failure(error!)
            }
        });
        task.resume()
        
    }
    func getProductWithUPC(upc: String, success: @escaping ([Product]) -> (), failure: @escaping (Error) -> ()) {
        // http://api.walmartlabs.com/v1/items?apiKey=69sak8n5jctvbapcs8wp88tt&upc=035000521019
        
        var upc = upc
        // need to handle barcode types to categorize
        // for barcode type : Barcode (EAN-13) with 0 in front, convert to UPC by getting rid of the zero
        if upc.characters.count == EAN_LENGTH {
            // take out the country code (the first character)
            upc.remove(at: upc.startIndex)
        }
        guard let url = URL(string:"http://api.walmartlabs.com/v1/items?apiKey=\(self.apiKey)&upc=\(upc)") else {return}
        let request = URLRequest(url: url)
        let task : URLSessionDataTask = session.dataTask(with: request, completionHandler: { (data, response, error) in
            if let data = data {
                if let responseDictionary = try! JSONSerialization.jsonObject(with: data, options: []) as? NSDictionary {
                    guard let productsDictionary = responseDictionary["items"] as? [NSDictionary] else {return}
                    let products = Product.productsWithArray(dictionaries: productsDictionary, api: apiType.walmart)
                    success(products)
                }
            }
            else if error != nil {
                failure(error!)
            }
        });
        task.resume()
    }
    
    func getReviewsFromProduct(itemId: String, success: @escaping ([Review]) -> (), failure: @escaping (Error) -> ()){
        guard let url = URL(string:"http://api.walmartlabs.com/v1/reviews/\(itemId)?apiKey=\(self.apiKey)") else {return}
        let request = URLRequest(url: url)
        let task : URLSessionDataTask = session.dataTask(with: request, completionHandler: { (data, response, error) in
            if let data = data {
                if let responseDictionary = try! JSONSerialization.jsonObject(with: data, options: []) as? NSDictionary {
                    
                    guard let reviewsDictionary = responseDictionary["reviews"] as? [NSDictionary] else {return}
                    let reviews = Review.reviewWithArray(dictionaries: reviewsDictionary)
                    success(reviews)

                }
            }
            else if error != nil {
                failure(error!)
            }
        });
        task.resume()
    }
    
    func getSimilarProducts(itemId: String, success: @escaping ([Product]) -> (), failure: @escaping (Error) -> ()){
        let urlString = "http://api.walmartlabs.com/v1/nbp?apiKey=\(self.apiKey)&itemId=\(itemId)"
        guard let url = URL(string: urlString) else { return failure(FastCartError(message: "Invalid url: \(urlString).", kind: .invalidUrl) )}
        let request = URLRequest(url: url)
        let task: URLSessionDataTask = session.dataTask(with: request, completionHandler: { (data, response, error) in
            guard error == nil else { return failure(error!) }
            guard let data = data else { return failure(FastCartError(message: "Failed to parse data", kind: .generic)) }
            guard let productsDictionary = try! JSONSerialization.jsonObject(with: data, options: []) as? [NSDictionary] else { return failure(FastCartError(message: "Failed to parse similar products ", kind: .generic))}
            let products = Product.productsWithArray(dictionaries: productsDictionary, api: .walmart)
            return success(products)
        })
        task.resume()
    }
    
    func getNearbyStores(lat: Double, lon: Double, success: @escaping ([Store]) -> (), failure: @escaping (Error) -> ()){
        guard let url = URL(string: "http://api.walmartlabs.com/v1/stores?apiKey=\(self.apiKey)&lon=\(lon)&lat=\(lat)&format=json") else { return }
        let request = URLRequest(url: url)
        let task : URLSessionDataTask = session.dataTask(with: request, completionHandler: { (data, response, error) in
            if let data = data {
                if let storesDictionary = try! JSONSerialization.jsonObject(with: data, options: []) as? [NSDictionary] {
                    let stores = Store.stores(from: storesDictionary)
                    success(stores)
                    
                }
            }
            else if error != nil {
                failure(error!)
            }
        })
        task.resume()
    }
}
