//
//  Offers.swift
//  FastCart
//
//  Created by Luis Perez on 12/10/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import EVReflection

enum Condition: String {
    case new = "New"
    case used = "Used"
}
enum Availability: String {
    case available = ""
    case outOfStock = "Out of Stock"
}

// Used in conjunction with the UPC API for Price comparison.
// Currently doest not need persistence nor does it need to be stored
// in the database. 
class Offer: EVObject {
    class func offers(from array: [NSDictionary]) -> [Offer]{
        return array.map({ return Offer(dictionary: $0) })
    }
    
    /** Online store name. */
    var merchant: String?
    /** Online store domain. */
    var domain: String?
    /** Item name marketed by the merchant. */
    var title: String?
    /** Currency of the list_price & price. Can be “USD”, “CAD”, “EUR”, “GBP”, “SEK”. Default “” means “USD” */
    var currency: String?
    /** Original price from the store. */
    var list_price: Double = 0.0
    /** Sale price. */
    var price: Double = 0.0
    var priceAsString: String {
        return Utilities.moneyToString(price)
    }
    /** “Free Shipping” or other shipping information if not free. */
    var shipping: String?
    var condition: Condition = .new
    var availability: Availability = .available
    /** Shop link of the item. */
    var link: URL?
    /** Unix timestamp of the offer was last updated. */
    var updated_t: Date?
    
    override func propertyConverters() -> [(String?, ((Any?) -> ())?, (() -> Any?)?)] {
        return [
            ("condition", { self.condition = Condition(rawValue: ($0 as? String) ?? "New")! }, { return self.condition.rawValue }),
            ("availability", { self.availability = Availability(rawValue: ($0 as? String) ?? "")! }, { return self.availability.rawValue }),
            ("link", { self.link = URL.fromJson(json: $0 as? String) }, { return self.link?.toJson() ?? "nil" }),
            ("updated_t", { self.updated_t = Date(timeIntervalSince1970: ($0 as? Double) ?? 0.0) }, { return self.updated_t?.timeIntervalSince1970 ?? "" }),
        ]
    }
}
