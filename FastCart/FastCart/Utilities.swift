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
    /**
     
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
        defaults.set(object.toDictionary(), forKey: key)
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
        if let dictionary = defaults.value(forKey: key) as? NSDictionary {
            return Object.init(dictionary: dictionary)
        }
        return nil
    }
}
