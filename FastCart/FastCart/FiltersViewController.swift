//
//  FiltersViewController.swift
//  FastCart
//
//  Created by Belinda Zeng on 12/9/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import LUExpandableTableView

extension FiltersViewController: LUExpandableTableViewDataSource {
    func numberOfSections(in expandableTableView: LUExpandableTableView) -> Int {
        return filters.count
    }
    
    
    func expandableTableView(_ expandableTableView: LUExpandableTableView, numberOfRowsInSection section: Int) -> Int {
        if section == shippingIndex {
            return shippingOptions.count
        }
        return 1
    }
    
    func expandableTableView(_ expandableTableView: LUExpandableTableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let optionCell = expandableTableView.dequeueReusableCell(withIdentifier: cellReuseIdentifier) as? FilterTableViewCell else {
            assertionFailure("Cell shouldn't be nil")
            return UITableViewCell()
        }
        guard let priceCell = expandableTableView.dequeueReusableCell(withIdentifier: "PriceFilterCell") as? PriceFilterTableViewCell else {
            assertionFailure("Cell shouldn't be nil")
            return UITableViewCell()
        }
        
        guard let colorCell = expandableTableView.dequeueReusableCell(withIdentifier: "ColorFilterCell") as? ColorFilterTableViewCell else {
            assertionFailure("Cell shouldn't be nil")
            return UITableViewCell()
        }
        
        if indexPath.section == shippingIndex {
            optionCell.label.text = shippingOptions[indexPath.row]
            optionCell.selectionStyle = UITableViewCellSelectionStyle.none
            
//            optionCell.selectionStyle = UITableViewCellSelectionStyle.
        } else if indexPath.section == colorIndex {
            colorCell.delegate = self
            colorCell.selectionStyle = UITableViewCellSelectionStyle.none
            return colorCell
        } else if indexPath.section == priceIndex {
            priceCell.label.text = "Price"
            priceCell.delegate = self
            return priceCell
        } else {
            optionCell.label.text = "Branding"
        }
        
//        cell.optionLabel.text = "Cell at row \(indexPath.row) section \(indexPath.section)"
        
        return optionCell
    }
    
    func expandableTableView(_ expandableTableView: LUExpandableTableView, sectionHeaderOfSection section: Int) -> LUExpandableTableViewSectionHeader {
        
        guard let sectionHeader = expandableTableView.dequeueReusableHeaderFooterView(withIdentifier: sectionHeaderReuseIdentifier) as? MyExpandableTableViewSectionHeader else {
            assertionFailure("Section header shouldn't be nil")
            return LUExpandableTableViewSectionHeader()
        }
        
        if section == shippingIndex {
            sectionHeader.label.text = "Shipping"
        } else if section == colorIndex {
            sectionHeader.label.text = "Colors"
        } else if section == priceIndex {
            sectionHeader.label.text = "Price"
        } else if section == brandIndex {
            sectionHeader.label.text = "Brand"
        }
        
        
        return sectionHeader
    }
    
    
}

// MARK: - LUExpandableTableViewDelegate

extension FiltersViewController: LUExpandableTableViewDelegate {
    func expandableTableView(_ expandableTableView: LUExpandableTableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        /// Returning `UITableViewAutomaticDimension` value on iOS 9 will cause reloading all cells due to an iOS 9 bug with automatic dimensions
        if indexPath.section == colorIndex {
            return 125
        }
        return 30
    }
    
    func expandableTableView(_ expandableTableView: LUExpandableTableView, heightForHeaderInSection section: Int) -> CGFloat {
        /// Returning `UITableViewAutomaticDimension` value on iOS 9 will cause reloading all cells due to an iOS 9 bug with automatic dimensions
        return 40
    }
    
    // MARK: - Optional
    
    func expandableTableView(_ expandableTableView: LUExpandableTableView, didSelectRowAt indexPath: IndexPath) {
        guard let cell = expandableTableView.cellForRow(at: indexPath) else {return }
        if indexPath.section == shippingIndex {
            
            
            cell.tintColor = UIColor.lightGray
            // check to see if already selected
            if selectedShipping.contains(indexPath.row) {
                cell.accessoryType = UITableViewCellAccessoryType.none
            } else {
            cell.accessoryType = UITableViewCellAccessoryType.checkmark
            selectedShipping.append(indexPath.row)
            }
            
        }
        print("Did select cell at section \(indexPath.section) row \(indexPath.row)")
            
    }
    
    func expandableTableView(_ expandableTableView: LUExpandableTableView, didSelectSectionHeader sectionHeader: LUExpandableTableViewSectionHeader, atSection section: Int) {
        print("Did select cection header at section \(section)")
    }
    
    func expandableTableView(_ expandableTableView: LUExpandableTableView, willDisplay cell: UITableViewCell, forRowAt indexPath: IndexPath) {
        print("Will display cell at section \(indexPath.section) row \(indexPath.row)")
    }
    
    func expandableTableView(_ expandableTableView: LUExpandableTableView, willDisplaySectionHeader sectionHeader: LUExpandableTableViewSectionHeader, forSection section: Int) {
        print("Will display section header for section \(section)")
    }
}

protocol FiltersViewControllerDelegate:class {
    func didFilter(view: FiltersViewController, selectedPrice: Int, selectedColor: [String], selectedShipping: [String])
}

class FiltersViewController: UIViewController, ColorFilterTableViewCellDelegate, PriceFilterTableViewCellDelegate {
    var selectedShipping = [Int]()
    var selectedColor = [UIColor]()
    var selectedMaxPrice = 500.0
    
    weak var delegate: FiltersViewControllerDelegate!
    
    @IBOutlet weak var filterButton: UIButton!
    
    private let expandableTableView = LUExpandableTableView()
    
    fileprivate let sectionHeaderReuseIdentifier = "MySectionHeader"
    fileprivate let cellReuseIdentifier = "FilterCell"
    
    let shippingIndex = 0
    let colorIndex = 1
    let priceIndex = 2
    let brandIndex = 3
    
    let shippingOptions = ["Ship to Home", "FREE Pickup", "FREE Pickup Today"]
    
    @IBOutlet weak var tableView: UITableView!
    
    let filtersCode = ["pickup_and_delivery", "color", "price"]
    let filters = ["Shipping", "Color", "Price"]
    override func viewDidLoad() {
        super.viewDidLoad()
    
        self.navigationController?.navigationBar.barTintColor = UIColor(red: 40/255, green: 44/255, blue: 52/255, alpha: 1)
        let attrs = [
            NSForegroundColorAttributeName: UIColor.white
        ]
        self.navigationController?.navigationBar.titleTextAttributes = attrs
        
        self.navigationController?.navigationItem.titleView?.frame.origin.x = CGFloat(10)

        // Do any additional setup after loading the view.
        view.addSubview(expandableTableView)
        expandableTableView.separatorStyle = .none
        
        expandableTableView.register(FilterTableViewCell.self, forCellReuseIdentifier: cellReuseIdentifier)
        expandableTableView.register(PriceFilterTableViewCell.self, forCellReuseIdentifier: "PriceFilterCell")
        expandableTableView.register(ColorFilterTableViewCell.self, forCellReuseIdentifier: "ColorFilterCell")
        expandableTableView.register(UINib(nibName: "FiltersSectionHeader", bundle: Bundle.main), forHeaderFooterViewReuseIdentifier: sectionHeaderReuseIdentifier)
        
        expandableTableView.expandableTableViewDataSource = self
        expandableTableView.expandableTableViewDelegate = self
        
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        
        expandableTableView.frame = view.bounds
        expandableTableView.frame.size.height -= 60
        
        expandableTableView.backgroundColor = UIColor(red: 62/255, green: 64/255, blue: 70/255, alpha: 1)
//        expandableTableView.frame.origin.y += 0
        self.view.backgroundColor = UIColor(red: 62/255, green: 64/255, blue: 70/255, alpha: 1)
        
        filterButton.frame = CGRect(x: self.view.frame.size.width / 2 - CGFloat(50) , y: self.view.frame.size.height - CGFloat(50), width: 100, height: 40)
        filterButton.layer.cornerRadius = 5
    }
    
    
    @IBAction func onFilterButton(_ sender: Any) {
        print(selectedShipping)
        print(selectedColor)
        print(Int(selectedMaxPrice))
        var colorDict = [UIColor.red: "Red", UIColor.green: "Green", UIColor.blue: "Blue", UIColor.yellow: "Gold", UIColor.purple: "Purple", UIColor.black: "Black", UIColor.gray: "Silver", UIColor.white: "White"]
        
        var colorStrings = [String]()
        
        for color in selectedColor {
            print(color)
            if let colorString = colorDict[color] {
                colorStrings.append(colorString)
                print(colorString)
            }
        }
        
        var shippingStrings = [String]()
        
        var shippingDict = ["Ship%20to%20Home", "FREE%20Pickup", "FREE%20Pickup%20Today"]
        
        for shipping in selectedShipping {
            let shippingString = shippingDict[shipping]
            shippingStrings.append(shippingString)
        }
        
        delegate.didFilter(view: self, selectedPrice: Int(selectedMaxPrice), selectedColor: colorStrings, selectedShipping: shippingStrings)
        self.dismiss(animated: true, completion: nil)
        
    }
    func didSelectColors(cell: ColorFilterTableViewCell, selectedViews: [UIColor]) {
        selectedColor = selectedViews
        print(selectedViews)
    }
    func didSelectPrice(cell: PriceFilterTableViewCell, selectedPrice: Double) {
        selectedMaxPrice = selectedPrice
        print(selectedMaxPrice)
        
        
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */
    
    

}
