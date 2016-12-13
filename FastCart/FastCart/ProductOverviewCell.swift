//
//  ProductOverviewCell.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/23/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import AVFoundation

protocol ScrollCellDelegate:class {
    func didSelectIndexForCell(cell: UICollectionViewCell, index: Int)
}

class ProductOverviewCell: UICollectionViewCell, ImageScrollViewDataSource{
    
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var priceLabel: UILabel!
    @IBOutlet weak var heartImage: UIImageView!
    
    @IBOutlet weak var productScrollView: ImageScrollView!
    
    // If set, reports the image selecting a specfic image.
    weak var delegate: ScrollCellDelegate?
    
    override var bounds: CGRect {
        didSet {
            contentView.frame = bounds
        }
    }
    
    var product: Product! {
        didSet {
            nameLabel.text = product.name
            priceLabel.text = product.salePriceAsString
            heartImage.image = (User.currentUser?.favoriteProducts.contains(product) ?? false) ? #imageLiteral(resourceName: "heart_filled") : #imageLiteral(resourceName: "heart")
            productScrollView.datasource = self
            productScrollView.placeholderImage = #imageLiteral(resourceName: "noimagefound")
            productScrollView.show()
        }
    }
    var imageIndex: Int = 0 {
        didSet {
            productScrollView.initialPage = imageIndex
        }
    }
    
    /** MARK - ImageScrollViewDataSource */
    func numberOfImages() -> Int {
        return product.variantImages.count
    }
    
    func imageURL(index: Int) -> URL {
        self.delegate?.didSelectIndexForCell(cell: self, index: index)
        return product.variantImages[index] as URL
    }
}
