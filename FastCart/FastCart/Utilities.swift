//
//  Utilities.swift
//  FastCart
//
//  Created by Luis Perez on 11/19/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import EVReflection

/**
 A container for re-usuable functions. We like to code in a `functional` way, so common functions that may typically be stored within an object are instead stored here, to avoid inheritence and Ctrl-C, Ctrl-V behaviour.
 
 - Author:
    Luis Perez
 */
class Utilities {
    /** Mark -- Private variables */
    private static let formatter = DateFormatter()
    
    /**
     Updates the image `view` withAsset. If `withPreview` is set, first loads the `withPreview` resource (assumed to be small) and fades this as the image, and only after that request is done does it fade in the `withAsset` image. If `withPlaceholder` is given, as soon as the imageview is accessible, the placeholder image is set.
     
     - Author:
        Luis Perez
     
     - parameters:
        - view: The `UIImageView` to be updated.
        - withAsset: The `URLRequest` to be executed to retrieve the final image asset for the `view`
        - withPreview: The `URLRequest` to be executed first in order to retrieve a low-cost asset to quickly display to the user (especially if under slow network connections).
        - withPlaceholder: The `UIImage` to be used as a placeholder as soon as the `view` is visible.
     */
    static func updateImageView(_ view: UIImageView, withAsset asset: URLRequest, withPreview preview: URLRequest?, withPlaceholder placeholder: UIImage?) -> Void {
        view.image = nil
        let small = preview ?? asset
        var completion = { (sucess:Bool, smallImage: UIImage) -> Void in
            
            // The AFNetworking ImageView Category only allows one request to be sent at a time
            // per ImageView. This code must be in the completion block.
            view.setImageWith(
                asset,
                placeholderImage: smallImage,
                success: { (largeImageRequest, largeImageResponse, largeImage) -> Void in
                    view.image = largeImage
            },
                failure: { (request, response, error) -> Void in
                    print("Error loading large image \(error)")
                    // Set small image!
                    view.image = smallImage
            })
        }
        if preview == nil {
            completion = {(sucess: Bool, smallImage: UIImage) -> Void in return }
        }
    
        view.setImageWith(small, placeholderImage: placeholder, success: { (smallImageRequest, smallImageResponse, smallImage) -> Void in
            
            // smallImageResponse will be nil if the smallImage is already available
            // in cache (might want to do something smarter in that case).
            view.alpha = 0.0
            view.image = smallImage;
            
            let duration = smallImageResponse == nil ? 0 : 0.5
            
            UIView.animate(withDuration: duration, animations: { () -> Void in
                
                view.alpha = 1.0
                
            }, completion: {(success) -> Void in
                completion(success, smallImage)
            })
        }, failure: { (request, response, error) -> Void in
            // Try to get the large image
            view.setImageWith(
                asset,
                placeholderImage: placeholder,
                success: { (largeImageRequest, largeImageResponse, largeImage) -> Void in
                    view.image = largeImage
            },
                // Failed at large and small
                failure: { (request, response, error) -> Void in
                    print("Error loading both images \(error)")
                    // Set placeholder image!
                    view.image = placeholder
            })
        })
    }
    
    /**
     Persists `object` in local storage `withKey`.
     
     - author: 
        Luis Perez
     
     - parameters:
        - object: The object to be persisted.
        - withKey: The key which can later be used for retrieval
     */
    static func persist(object: EVObject, withKey key: String) {
        let defaults = UserDefaults.standard
        defaults.set(object.toJsonString(), forKey: key)
    }
    
    /**
     Loads an object from local storage as specified `fromKey`. 
     
     - author:
        Luis Perez
     
     - parameters:
        - fromKey: The key to be used to retrieve the object. If the key does not exists, retrieval will fail.
        - into: The Class the object will be stored into.
     
     - returns:
        Returns the retrieved object, or nil on failure.
     */
    static func load(fromKey key: String, into Object: EVObject.Type) -> EVObject? {
        let defaults = UserDefaults.standard
        if let jsonString = defaults.value(forKey: key) as? String {
            return Object.init(json: jsonString)
        }
        return nil
    }
    
    /**
     Converts the given value into the appropriate monetary string representation.
     
     - author:  
        Luis Perez
     
     - parameters:
        - amount: The monetary amount to be converted.
     - returns:
        The string representation. This will eventually conform to other types.
     */
    static func moneyToString(amount: Double) -> String {
        return String(format: "$%.2f", amount)
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
    static func formatTimeToString(date: Date) -> String {
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
}
