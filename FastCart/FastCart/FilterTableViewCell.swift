//
//  FilterTableViewCell.swift
//  FastCart
//
//  Created by Belinda Zeng on 12/9/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class FilterTableViewCell: UITableViewCell {

    var label = UILabel()
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
        
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
    // MARK: - Init
    
    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        
        contentView.addSubview(label)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // MARK: - Base Class Overrides
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        label.frame = contentView.bounds
        label.frame.origin.x += 12
    }
}
