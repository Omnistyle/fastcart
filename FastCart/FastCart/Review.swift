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
    var date: NSDate?
    var userImageURL: String?
    
    func parseSave(){
        print(self)
    }
    
    init(dictionary: NSDictionary){
        super.init()
        title = dictionary["title"] as? String
        username = dictionary["reviewer"] as? String
        comment = dictionary["reviewText"] as? String
        
        let timestampString = dictionary["submissionTime"] as? String
        if let timestampString = timestampString {
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
            date = formatter.date(from: timestampString) as NSDate?
        }
        
        let overallRating = dictionary["overallRating"] as! NSDictionary
        //var stringRating = overallRating["rating"] as! String
        rating = Int(overallRating["rating"] as! String)
        
    }
    
    required init() {
        fatalError("init() has not been implemented")
    }
    
    class func reviewWithArray(dictionaries: [NSDictionary]) -> [Review]{
        var reviews = [Review]()
        for dictionary in dictionaries{
            let review = Review.init(dictionary: dictionary)
            reviews.append(review)
        }
        
        return reviews
    }
    
//    static func getReviews(itemId: String) -> [Review] {
//        let reviews = [Review]()
//        WalmartClient.sharedInstance.getReviewsFromProduct(itemId: itemId, success: { (reviewsDictionary:[Review]) in
//            
//            
//            var revs = reviews
//        }, failure: {(error: Error) -> () in
//            print(error.localizedDescription)
//        })
//        
//    }
}
