from .models import Puzzle, Clue
from reportlab.pdfgen import canvas


def make_pdf(response, puzzle_id):
    puzzle = Puzzle.objects.get(pk=puzzle_id)
    clues = Clue.objects.filter(puzzle=puzzle)

    # Create the PDF object, using the response object as its "file."
    p = canvas.Canvas(response)

    # Draw grid
    puzzle_template = [puzzle.puzzle_text[i*puzzle.size:(i+1)*puzzle.size] for i in range(puzzle.size)]
    grid_size = 250
    sq_size = grid_size / puzzle.size
    start_x = 800
    start_y = 100
    for i in range(len(puzzle_template)):
        for j in range(len(puzzle_template[0])):
            if puzzle_template[i][j] == ' ':
                f = 1
            else:
                f = 0
            p.rect(start_y+j*sq_size, start_x-i*sq_size, sq_size, sq_size, fill=f)
    # Draw cell numbers
    p.setFont("Helvetica", sq_size/4)
    for c in clues:
        p.drawString(start_y+c.start_y*sq_size+1, start_x-c.start_x*sq_size+sq_size-sq_size/4-1, str(c.start_num))

    # Close the PDF object cleanly, and we're done.
    p.showPage()
    p.save()
    return p


if __name__ == '__main__':
    p = make_pdf('puzzle.pdf', 5)
