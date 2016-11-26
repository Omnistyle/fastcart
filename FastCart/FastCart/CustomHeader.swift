//
//  CustomHeader.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/21/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import AVFoundation

class CustomHeader: UIView {

    @IBOutlet private weak var backgroundImage: UIImageView!
    @IBOutlet private weak var foregroundImage: UIImageView!
    
    let iconsInSection1 = [UIImage]()
    let iconsInSection2 = [UIImage]()
    var backgroundImageUrl: URL? {
        didSet {
            if let url = backgroundImageUrl {
                backgroundImage.setImageWith(url)
                
            }
        }
    }
    func makeBlackAndWhite(image: UIImage) -> UIImage{
        let imageRect:CGRect = CGRect(x: 0, y: 0, width: image.size.width, height: image.size.height)
        let colorSpace = CGColorSpaceCreateDeviceGray()
        let width = image.size.width
        let height = image.size.height
        
        let bitmapInfo = CGBitmapInfo(rawValue: CGImageAlphaInfo.none.rawValue)
        let context = CGContext(data: nil, width: Int(width), height: Int(height), bitsPerComponent: 8, bytesPerRow: 0, space: colorSpace, bitmapInfo: bitmapInfo.rawValue)
        context?.draw(image.cgImage!, in: imageRect)
        let imageRef = context!.makeImage()
        let newImage = UIImage(cgImage: imageRef!)
        return newImage
    }
    
    var foregroundImageUrl: URL? {
        didSet {
            if let url = foregroundImageUrl {
                foregroundImage.setImageWith(url)
                let image = foregroundImage.image
                //create filter
                let newImage = makeBlackAndWhite(image: image!)
                foregroundImage.image = newImage
                
                let cornerRadius = foregroundImage.frame.width / 2.0
                foregroundImage.layer.cornerRadius = cornerRadius
                foregroundImage.layer.masksToBounds = true
            }
        }
    }
}
