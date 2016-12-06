//
//  ProductOverviewCell.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/23/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import AVFoundation

class ProductOverviewCell: UICollectionViewCell{
    
    @IBOutlet weak var productImage: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var priceLabel: UILabel!
    @IBOutlet weak var heartImage: UIImageView!
    
    override var bounds: CGRect {
        didSet {
            contentView.frame = bounds
        }
    }
    
    var product: Product! {
        didSet {
            nameLabel.text = product.name
            priceLabel.text = product.salePriceAsString
            if let image = product.image {
                productImage.setImageWith(image as URL)
            }
        }
    }
}
