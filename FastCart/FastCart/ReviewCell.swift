//
//  ReviewCell.swift
//  FastCart
//
//  Created by Jose Villanuva on 12/4/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class ReviewCell: UITableViewCell {

    
    @IBOutlet weak var ratingImage: UIImageView!
    
    @IBOutlet weak var titleLabel: UILabel!
    
    @IBOutlet weak var dateLabel: UILabel!
    
    @IBOutlet weak var usernameLabel: UILabel!
    
    @IBOutlet weak var commentLabel: UILabel!
    
    var review : Review! {
        didSet {
            //ratingImage =
            let imageUrlString = getRatingImageUrlString(rating: review.rating!)
            let imgUrl = URL(string: imageUrlString)
            ratingImage.setImageWith(imgUrl!)
            
            titleLabel.text = review.title
            dateLabel.text = formatTimeToString(date: review.date as! Date)
            usernameLabel.text = review.username
            commentLabel.text = review.comment
        }
    }
    
    func formatTimeToString(date: Date) -> String {
        
        let cal = NSCalendar(calendarIdentifier: NSCalendar.Identifier.gregorian)
        let components = cal!.components([.day, .month, .year], from: date)
        
        var monthString = ""
        if let monthNumver = components.month {
            monthString = getMonthName(monthNumber: monthNumver)
        }
        
        var yearString = ""
        if let yearNumber = components.year {
            yearString = String(yearNumber)
        }

        var dayString = ""
        if let dayNumber = components.day {
            dayString = String(dayNumber)
        }
        
        let dateString = monthString + " " + dayString + ", " + yearString
        return dateString
    }
    
    func getRatingImageUrlString(rating: Int) -> String {
        switch rating {
        case 0:
            return "https://www.walmart.com/i/CustRating/0.gif"
        case 1:
            return "https://www.walmart.com/i/CustRating/1.gif"
        case 2:
            return "https://www.walmart.com/i/CustRating/2.gif"
        case 3:
            return "https://www.walmart.com/i/CustRating/3.gif"
        case 4:
            return "https://www.walmart.com/i/CustRating/4.gif"
        case 5:
            return "https://www.walmart.com/i/CustRating/5.gif"
        default:
            return "https://www.walmart.com/i/CustRating/0.gif"
        }
    }
    
    func getMonthName(monthNumber: Int) -> String {
        switch monthNumber {
        case 1:
            return "January"
        case 2:
            return "February"
        case 3:
            return "March"
        case 4:
            return "April"
        case 5:
            return "May"
        case 6:
            return "June"
        case 7:
            return "July"
        case 8:
            return "August"
        case 9:
            return "September"
        case 10:
            return "October"
        case 11:
            return "November"
        case 12:
            return "December"
        default:
            return "January"
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
