//
//  CollectionViewStickyHeaders.swift
//  FastCart
//
//  Created by Luis Perez on 12/9/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import SAParallaxViewControllerSwift

// Overrides SAParallaxViewLayout to implement functionality for sticky headers.
class StickyHeaderFlowLayout: SAParallaxViewLayout {
    
    public override init() {
        super.init()
        initialize()
    }
    
    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        initialize()
    }
    
    private func initialize() {
        let width = UIScreen.main.bounds.size.width
        let height = CGFloat(40.0)
        headerReferenceSize = CGSize(width: width, height: height)
        // footerReferenceSize = CGSize(width: width, height: height)
    }

    
    override func shouldInvalidateLayout(forBoundsChange newBounds: CGRect) -> Bool {
        // Return true so we're asked for layout attributes as the content is scrolled
        return true
    }
    
    override func layoutAttributesForElements(in rect: CGRect) -> [UICollectionViewLayoutAttributes]? {
        // Get the layout attributes for a standard UICollectionViewFlowLayout
        guard var elementsLayoutAttributes = super.layoutAttributesForElements(in: rect) else { return nil }
        

        // Define a struct we can use to store optional layout attributes in a dictionary
        struct HeaderAttributes {
            var layoutAttributes: UICollectionViewLayoutAttributes?
        }
        var visibleSectionHeaderLayoutAttributes = [Int : HeaderAttributes]()
        
        
        // Loop through the layout attributes we have
        for (index, layoutAttributes) in elementsLayoutAttributes.enumerated() {
            let section = layoutAttributes.indexPath.section
            
            switch layoutAttributes.representedElementCategory {
            case .supplementaryView:
                // If this is a set of layout attributes for a section header, replace them with modified attributes
                if layoutAttributes.representedElementKind == UICollectionElementKindSectionHeader {
                    guard let newLayoutAttributes = layoutAttributesForSupplementaryView(ofKind: UICollectionElementKindSectionHeader, at: layoutAttributes.indexPath) else { break }
                    elementsLayoutAttributes[index] = newLayoutAttributes                    
                    // Store the layout attributes in the dictionary so we know they've been dealt with
                    visibleSectionHeaderLayoutAttributes[section] = HeaderAttributes(layoutAttributes: newLayoutAttributes)
                }
                
            case .cell:
                // Check if this is a cell for a section we've not dealt with yet
                if visibleSectionHeaderLayoutAttributes[section] == nil {
                    // Stored a struct for this cell's section so we can can fill it out later if needed
                    visibleSectionHeaderLayoutAttributes[section] = HeaderAttributes(layoutAttributes: nil)
                }
                
            case .decorationView:
                break
            }
        }
        
        // Loop through the sections we've found
        for (section, headerAttributes) in visibleSectionHeaderLayoutAttributes {
            // If the header for this section hasn't been set up, do it now
            if headerAttributes.layoutAttributes == nil {
                guard let newAttributes = layoutAttributesForSupplementaryView(ofKind: UICollectionElementKindSectionHeader, at: IndexPath(item: 0, section: section)) else { continue }
                elementsLayoutAttributes.append(newAttributes)
            }
        }
        
        return elementsLayoutAttributes
    }
    
    override func layoutAttributesForSupplementaryView(ofKind elementKind: String, at indexPath: IndexPath) -> UICollectionViewLayoutAttributes? {
        // Get the layout attributes for a standard flow layout
        let attributes = super.layoutAttributesForSupplementaryView(ofKind: elementKind, at: indexPath)
        
        // If this is a header, we should tweak it's attributes
        if elementKind == UICollectionElementKindSectionHeader {
            if let fullSectionFrame = frameForSection(section: indexPath.section) {
                let minimumY = max(collectionView!.contentOffset.y + collectionView!.contentInset.top, fullSectionFrame.origin.y)
                let maximumY = fullSectionFrame.maxY - headerReferenceSize.height - collectionView!.contentInset.bottom
                
                attributes?.frame = CGRect(x: 0, y: min(minimumY, maximumY), width: collectionView!.bounds.size.width, height: headerReferenceSize.height)
                attributes?.zIndex = 1
            }
        }
        
        return attributes
    }
    
    private func frameForSection(section: Int) -> CGRect? {
        
        // Sanity check
        let numberOfItems = collectionView!.numberOfItems(inSection: section)
        if numberOfItems < 1 {
            return nil
        }
        
        // Get the index paths for the first and last cell in the section
        let firstIndexPath = IndexPath(row: 0, section: section)
        let lastIndexPath = IndexPath(row: numberOfItems - 1, section: section)
        
        // Work out the top of the first cell and bottom of the last cell
        guard let firstCellTop = layoutAttributesForItem(at: firstIndexPath)?.frame.origin.y else { return nil }
        guard let lastCellBottom = layoutAttributesForItem(at: lastIndexPath)?.frame.maxY else { return nil }
        
        // Build the frame for the section
        var frame: CGRect = .zero
        
        frame.size.width = collectionView!.bounds.size.width
        frame.origin.y = firstCellTop
        frame.size.height = lastCellBottom - firstCellTop
        
        // Increase the frame to allow space for the header
        frame.origin.y -= headerReferenceSize.height
        frame.size.height += headerReferenceSize.height
        
        // Increase the frame to allow space for any section insets
        frame.origin.y -= sectionInset.top
        frame.size.height += sectionInset.top
        
        frame.size.height += sectionInset.bottom
        
        return frame
    }
}
