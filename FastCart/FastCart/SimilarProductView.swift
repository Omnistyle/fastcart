//
//  SimilarProductView.swift
//  
//
//  Created by Luis Perez on 12/11/16.
//
//

import UIKit

class SimilarProductView: UIView {
    @IBOutlet var contentView: UIView!
    @IBOutlet weak var priceLabel: UILabel!
    @IBOutlet weak var brandName: UILabel!
    @IBOutlet weak var productImage: UIImageView!
    
    var product: Product! {
        didSet {
            priceLabel.text = product.salePriceAsString
            brandName.text = product.brandName
            product.setProductImage(view: productImage)
        }
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        initSubviews()
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        initSubviews()
    }
    
    func initSubviews() {
        let nib = UINib(nibName: "SimilarProductView", bundle: nil)
        nib.instantiate(withOwner: self, options: nil)
        contentView.frame = bounds
        addSubview(contentView)
    }
}
