//
//  Product.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/7/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class Product: NSObject {
    var upc: String?
    var name: String?
    var overview: String?
    var image: URL?
    var store: Store?
    var salePrice: Double?
    var brandName: String?
    var averageRating: String?
    var color: String?
    var size: String?
    var recommended: [Product]?
    var freeShipToStore: Bool?
    var addToCartUrl: URL?
    var category: String?
        
    func formatTimeToString(date: NSDate) -> String {
        let interval = date.timeIntervalSinceNow
        let intervalInt = Int(interval) * -1
        let days = (intervalInt / 3600) / 24
        if days != 0 {
            let daysStr = String(days) + "d"
            return daysStr
        }
        let hours = (intervalInt / 3600)
        if hours != 0 {
            return String(hours) + "h"
        }
        
        let minutes = (intervalInt / 60) % 60
        if minutes != 0 {
            return String(minutes) + "m"
        }
        
        let seconds = intervalInt % 60
        if seconds != 0 {
            return String(seconds) + "s"
        }
        else  {
            return "Now"
        }
    }
    
    init(dictionary: NSDictionary) {
        super.init()
        upc = dictionary["upc"] as? String
        name = dictionary["name"] as? String
        overview = dictionary["shortDescription"] as? String
        if let imageString = dictionary["largeImage"] as? String{
            self.image = URL(string: imageString)
        }
        store = Store(id: "Walmart")
        // round to two decimals
        if let salePriceDouble = dictionary["salePrice"] as? Double {
            salePrice = round(salePriceDouble * 100)/100
        }
        brandName = dictionary["brandName"] as? String
        averageRating = dictionary["customerRating"] as? String
        color = dictionary["color"] as? String
        category = dictionary["categoryPath"] as? String
        size = dictionary["size"] as? String
        freeShipToStore =  dictionary["freeShipToStore"] as? Bool
    }
    
    class func productsWithArray(dictionaries: [NSDictionary]) -> [Product]{
        var products = [Product]()
        for dictionary in dictionaries {
            let product =
                Product.init(dictionary: dictionary)
            products.append(product)
        }
        return products
    }
    

}
