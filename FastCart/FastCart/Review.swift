//
//  Review.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import EVReflection

/** TODO: Document **/
class Review: EVObject {
    var title: String?
    var comment: String?
    var rating: Int?
    var username: String?
    var date: Date?
    var userImageURL: String?
    
    func parseSave(){
        print(self)
    }
}
