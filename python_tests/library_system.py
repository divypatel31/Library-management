# library_system.py

class Library:
    def __init__(self):
        self.books = {}

    def add_book(self, title, copies=1):
        if title in self.books:
            self.books[title] += copies
        else:
            self.books[title] = copies

    def borrow_book(self, title):
        if title in self.books and self.books[title] > 0:
            self.books[title] -= 1
            return True
        raise ValueError("Book is not available")

    def return_book(self, title):
        if title in self.books:
            self.books[title] += 1
            return True
        raise ValueError("This book does not belong to our library")

    def calculate_fine(self, days_late):
        if days_late <= 0:
            return 0
        return days_late * 10