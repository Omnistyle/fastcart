//
//  Product.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/7/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class Product: NSObject {
    var productName: NSString?
//        var timestamp: NSDate?
//        var retweetCount: Int = 0
//        var favoritesCount: Int = 0
//        var user: User?
//        var userImage: UIImage?
//        var name: NSString?
//        var id: NSString?
//        var dateStr: String?
    
        // var personallyRetweeted: Bool?
        
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
        productName = dictionary["name"] as? NSString
        print(productName)
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
