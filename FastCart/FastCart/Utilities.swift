//
//  Utilities.swift
//  FastCart
//
//  Created by Luis Perez on 11/19/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

// A class containing commonly re-used code. Implemented with entirely static methods.
class Utilities {
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
}
