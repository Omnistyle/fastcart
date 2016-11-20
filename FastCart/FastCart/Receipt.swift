//
//  Receipt.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class Receipt: NSObject {
    // List of products purchased with this receipt.
    var products: [Product] = []
    
    // The time at which the first product was added to the receipt.
    // If nil, the receipt has no products.
    var started: Date?
    var startedAsString: String? {
        return started?.description
    }
    
    // The timestamp when the user submitted the payment information for this receipt.
    // If nil, the receipt has not been paid for.
    var completed: Date?
    
    var total: Double = 0.0
    var totalAsString: String {
        return self.moneyToString(amount: self.total)
    }
    
    // Associate with a store.
    var store: Store = Store(id: "1")

    // The amount of tax charged for this receipt.
    var tax: Double = 0.0
    var taxAsString: String {
        return self.moneyToString(amount: self.tax)
    }
    
    // The subtotal on the receipt.
    var subTotal: Double = 0.0
    var subTotalAsString: String {
        return self.moneyToString(amount: self.subTotal)
    }
    
    // The payment method used to pay for this receipt, if paid.
    var payment: Payment?
    
    // Whether or not the receipt has been paid for.
    var paid: Bool = false
    
    // Converts a double to the correct string representation.
    private func moneyToString(amount: Double) -> String {
        return String(format: "$%.2f", amount)
    }
}
