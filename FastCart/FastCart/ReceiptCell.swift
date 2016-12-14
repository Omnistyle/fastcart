//
//  ReceiptCell.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/20/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import AVFoundation

class ReceiptCell: UITableViewCell {
    
    
    @IBOutlet weak var storeImage: UIImageView!
    
    @IBOutlet weak var storeLabel: UILabel!
    @IBOutlet weak var locationLabel: UILabel!
    @IBOutlet weak var priceLabel: UILabel!
    @IBOutlet weak var dateLabel: UILabel!
    
    var receipt: Receipt? {
        didSet {
            if let receipt = receipt {
                receipt.store.setStoreImage(view: storeImage)
                storeImage.layer.cornerRadius = storeImage.frame.size.width / 2
                storeImage.layer.masksToBounds = true
    //          storeImage.layer.borderColor = UIColor.lightGray.cgColor
    //          storeImage.layer.borderWidth = 1
                
                priceLabel.text = receipt.totalAsString
                storeLabel.text = receipt.store.name
                dateLabel.text = receipt.completedAsString//receipt.startedAsString
                locationLabel.text = receipt.store.locationAsString
            }
        }
    }
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}
