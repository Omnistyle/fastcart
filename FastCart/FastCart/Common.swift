//
//  Common.swift
//  FastCart
//
//  Created by Luis Perez on 11/25/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import EVReflection

/**
 Contains commonly used keys for storing data locally.
 */
public enum Persistece: String {
    case receipt = "currentReceipt"
    case user = "currentUser"
    
    static let allValues = [receipt, user]
}

extension URL {
    func toJson() -> String {
        return self.absoluteString
    }
    static func fromJson(json: String?) -> URL? {
        if let url = json {
            return URL(string: url)
        }
        return nil
    }
}
