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
    @IBOutlet weak var location: UILabel!
    @IBOutlet weak var storeImage: UIImageView!
    @IBOutlet weak var favoriteImage: UIImageView!
    
    var store: Store! {
        didSet {
            storeName.text = store.name
            favoriteImage.image = User.currentUser!.favoriteStores.contains(store) ? #imageLiteral(resourceName: "heart_filled") : #imageLiteral(resourceName: "heart")
            //storeImage = store._image
        }
    }
    
    override func awakeFromNib() {
        super.awakeFromNib()
        storeImage.frame.size.height = storeImage.frame.width
        // Store image rounded corner.
        storeImage.layer.cornerRadius = storeImage.frame.size.width / 2
        storeImage.layer.masksToBounds = true
        favoriteImage.image = #imageLiteral(resourceName: "heart")
    }
}
