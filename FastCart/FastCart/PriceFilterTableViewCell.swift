//
//  PriceFilterTableViewCell.swift
//  FastCart
//
//  Created by Belinda Zeng on 12/9/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import Foundation

import UIKit

protocol PriceFilterTableViewCellDelegate:class {
    func didSelectPrice(cell: PriceFilterTableViewCell, selectedPrice: Double)
}

class PriceFilterTableViewCell: UITableViewCell {
    
    var label = UILabel()
    
    weak var delegate: PriceFilterTableViewCellDelegate!
    
    var minPriceLabel = UILabel()
    var slider = UISlider()
    var maxPriceLabel = UILabel()
    var currentPriceLabel = UILabel()
    var selectedPrice = Double(500.0) {
        didSet {
            delegate.didSelectPrice(cell: self, selectedPrice: selectedPrice)
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
    
    // MARK: - Init
    
    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        self.layoutIfNeeded()
        
        self.backgroundColor = UIColor.clear
        contentView.backgroundColor = UIColor.clear
        
        contentView.addSubview(minPriceLabel)
        contentView.addSubview(maxPriceLabel)
        contentView.addSubview(slider)
        contentView.addSubview(currentPriceLabel)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // MARK: - Base Class Overrides
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        let padding = CGFloat(10)
        let widthFirst = CGFloat(40)
        let widthSecond = CGFloat(60)
        formatLabelForSideMenu(label: minPriceLabel)
        formatLabelForSideMenu(label: maxPriceLabel)
        formatLabelForSideMenu(label: currentPriceLabel)
        
        currentPriceLabel.font = UIFont.systemFont(ofSize: 11, weight: UIFont.Weight.light)
        currentPriceLabel.frame = CGRect(x: contentView.frame.width/2.0 - 20.0, y: -15.0, width: widthFirst + 40.0, height: contentView.frame.height)
        currentPriceLabel.text = "$500"

        
        minPriceLabel.frame = CGRect(x: padding, y: padding, width: widthFirst, height: contentView.frame.height)
        minPriceLabel.text = "$0"
        maxPriceLabel.frame = CGRect(x: contentView.frame.width - padding - widthSecond, y: padding, width: widthSecond, height: contentView.frame.height)
        maxPriceLabel.text = "$500"
        slider.frame = CGRect(x: padding + widthFirst, y: padding, width: contentView.frame.width - 2*padding - widthFirst - widthSecond, height: contentView.frame.height)
        slider.tintColor = UIColor.white
        slider.addTarget(self, action: #selector(PriceFilterTableViewCell.valueChanged(sender:)), for: .valueChanged)
        slider.isContinuous = false
        
        label.frame = contentView.bounds
        label.frame.origin.x += 12
    }
    
    @objc func valueChanged(sender: UISlider) {
       selectedPrice = Double(sender.value)*Double(500.0)
       let selectedPriceRounded = Double(round(100*selectedPrice)/100)
       currentPriceLabel.text = "$" + String(describing: selectedPriceRounded)
        
    }
        
    func formatLabelForSideMenu(label: UILabel) {
        label.textColor = UIColor(red: 145/255, green: 148/255, blue: 153/255, alpha: 1)
        label.font = UIFont.systemFont(ofSize: 14, weight: UIFont.Weight.light)
    }
}
