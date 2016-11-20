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
            if let image = self.receipt?.store.image {
                storeImage.setImageWith(image)
            }
            priceLabel.text = "$" + String(describing: self.receipt?.totalAsString)
            storeLabel.text = self.receipt?.store.name
            dateLabel.text = self.receipt?.startedAsString
            locationLabel.text = self.receipt?.store.locationAsString
            
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
