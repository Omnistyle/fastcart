//
//  Product.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/7/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import AFNetworking
import EVReflection

enum apiType {
    case walmart
    case upc
    case manual
}

class Product: EVObject {
    /** The UPC-13 code for Product */
    var upc: String?
    /** The short name of the Product */
    var name: String?
    /** A short descriptive overview of the Product */
    var overview: String?
    /** The URL for the image for the Product */
    var image: URL?
    /** The store from which the Product information is pulled */
    var store: Store?
    /** The current sale price of this specific product */
    var salePrice: Double?
    /** The brand name of the Product */
    var brandName: String?
    /** The average rating given to this Product across marketplaces */
    var averageRating: String?
    /** The color (if necessary) for the Product */
    var color: String?
    /** The size (if available) of the Product */
    var size: String?
    /** A list of similar product recommeded by other users */
    var recommended: [Product]?
    /** If true, the Product if free to ship to store */
    var freeShipToStore: Bool?
    /** The url for adding this product to the customers cart from the respective Store */
    var addToCartUrl: URL?
    /** A string description of the category this Product belongs to */
    var category: String?
    
    /** Mark -- Private variables */
    private let formatter = DateFormatter()
    
    /**
     Initialize `User` from a dictionary object.
     
     - author:
        Belinda Zeng
     
     - parameters: 
        - dictionary: The input dictionary.
        - api: The API from which the dictionary was retrieved.
     - returns: 
        A `User` with the fields set from `dictionary`
     */
    init(dictionary: NSDictionary, api: apiType) {
        switch api {
        case .walmart:
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
        case .upc:
            // often multiple objects in array though
            break
        case .manual:
            name = dictionary["name"] as? String
        }
    }
    
    required init() {
        fatalError("init() has not been implemented")
    }

    /**
     Pretty-formats a date.
     
     - author:
        Luis Perez
     
     - parameters:
        - date: The date to be converted.
     - returns:
        A pretty string for the date.
     */
    func formatTimeToString(date: Date) -> String {
        formatter.dateFormat = "M/d/yyyy"
        let elapsedTime = date.timeIntervalSinceNow
        let ti = -Int(elapsedTime)
        let days = (ti / (60*60*24))
        if days > 3 {
            return formatter.string(from: date)
        }
        if days > 0 {
            return "\(days) d"
        }
        let hours = (ti / (60*60)) % 24
        if hours > 0 {
            return "\(hours) h"
        }
        let minutes = (ti / 60) % 60
        if minutes > 0 {
            return "\(minutes) m"
        }
        let seconds = ti % 60
        return "\(seconds) s"
    }
    
    func parseSave(){
        print(self)
    }
    
    /**
     Updates an imageview to reflect the product.
     
     - author:
     Luis Perez
     
     - parameters:
        - image: The UIImageView to be updated to reflect this products image.
    */
    func setProductImage(view: UIImageView) -> Void {
        guard let largeImageURL = image else { return }
        Utilities.updateImageView(view, withAsset: URLRequest(url: largeImageURL), withPreview: nil, withPlaceholder: nil)
    }
    
    /**
     Converts responses from the `api` to an array of products.
     
     - Author:
        Belinda Zeng
     
     - parameters:
        - dictionaries: An array of responses from the api. Each response should map to a `Product`
        - api: The api from which the responses should be parsed.
     
     - returns:
        An array of Products.
     */
    class func productsWithArray(dictionaries: [NSDictionary], api: apiType) -> [Product]{
        var products = [Product]()
        for dictionary in dictionaries {
            let product =
                Product.init(dictionary: dictionary, api: api)
            products.append(product)
        }
        return products
    }
    
    

}
