//
//  StoreCellHeaderView.swift
//  FastCart
//
//  Created by Luis Perez on 12/9/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class StoreCellHeaderView: UICollectionReusableView {
    
    @IBOutlet weak var storeName: UILabel!
    @IBOutlet weak var favoriteImage: UIImageView!
    @IBOutlet weak var storeImage: UIImageView!
    
    var store: Store! {
        didSet {
            storeName.text = store.name
            favoriteImage.image = User.currentUser!.isFavorite(store: store) ? #imageLiteral(resourceName: "heart_filled") : #imageLiteral(resourceName: "heart")
            store.setStoreImage(view: storeImage)
        }
    }
    
    override func awakeFromNib() {
        super.awakeFromNib()
        
        // Store image rounded corner.
        storeImage.layer.cornerRadius = storeImage.frame.size.width / 2
        storeImage.layer.masksToBounds = true
        storeImage.layer.borderColor = UIColor.lightGray.cgColor
        storeImage.layer.borderWidth = 1
    }
    
}
