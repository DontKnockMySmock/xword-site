import match, gridNav,random, time
import subprocess, math
import shlex, os

def resizeWindow(n):
  id_cmd='xdotool getactivewindow'
  resize_cmd='xdotool windowsize --usehints {id} '+str(n*2+3)+' '+str(n+3)

  proc=subprocess.Popen(shlex.split(id_cmd),stdout=subprocess.PIPE)
  windowid,err=proc.communicate()
  proc=subprocess.Popen(shlex.split(resize_cmd.format(id=windowid)))
  proc.communicate()

functionTimes = {}

def timing(f):
  def wrap(*args):
    time1 = time.time()
    ret = f(*args)
    time2 = time.time()
    if f.func_name not in functionTimes.keys():
      functionTimes[f.func_name] = 0
    functionTimes[f.func_name] += (time2-time1)*1000.0
    return ret
  return wrap

class Delta:
  
  @timing
  def __init__(self, template):
    self.removedCells = {}
    self.removedAcross = {}
    self.removedDown = {}
    self.isDeadEnd = False
    
    # cells
    for i in range(len(template)):
      for j in range(len(template[0])):
        if template[i][j] == ' ': continue
        self.removedCells[(i,j)] = ''
    
    # across
    for i in range(len(template)):
      line = template[i]
      j = 0
      words = line.split(' ')
      for w in words:
        if len(w) != 0:
          self.removedAcross[(i,j)] = []
        j += len(w)+1
    
    # down
    for j in range(len(template[0])):
      line = ''.join([template[i][j] for i in range(len(template))])
      i = 0
      words = line.split(' ')
      for w in words:
        if len(w) != 0:
          self.removedDown[(i,j)] = []
        i += len(w)+1
  
  @timing
  def __repr__(self):
    cellline = 'cells: '+str(len(''.join(self.removedCells.values())))
    acrline = 'across: '+str(sum([len(acr) for acr in self.removedAcross.values()]))
    dwnline = 'down: '+str(sum([len(dwn) for dwn in self.removedDown.values()]))
    return cellline+'\n'+acrline+'\n'+dwnline
  
  @timing
  def updatedCells(self):
    u = []
    for c in self.removedCells.keys():
      if len(self.removedCells[c]) > 0:
        u.append(c)
    return u

class Grid:
  
  @timing
  def __init__(self, template, excludeWords = []):
    sideLen = int(math.sqrt(len(template)))
    self.template = []
    for i in range(sideLen):
      self.template.append(template[i*sideLen:(i+1)*sideLen])
    self.cells = {}
    self.across = {}
    self.down = {}
    self.assignments = []
    
    # cells
    for i in range(len(self.template)):
      for j in range(len(self.template[0])):
        if self.template[i][j] == ' ': continue
        if self.template[i][j] == '*': self.cells[(i,j)] = 'abcdefghijklmnopqrstuvwxyz'
        else: self.cells[(i,j)] = self.template[i][j].lower()
    
    # across
    for i in range(len(self.template)):
      line = self.template[i]
      j = 0
      words = line.split(' ')
      for w in words:
        if len(w) != 0:
          self.across[(i,j)] = match.getMatchingWords(w, excludeWords)
        j += len(w)+1
    
    # down
    for j in range(len(self.template[0])):
      line = ''.join([self.template[i][j] for i in range(len(self.template))])
      i = 0
      words = line.split(' ')
      for w in words:
        if len(w) != 0:
          self.down[(i,j)] = match.getMatchingWords(w, excludeWords)
        i += len(w)+1
  
    self.updateAll()
  
  @timing
  def __repr__(self):
    grid = ' '
    #regions = self.getRegions()
    regionKeys = ['.','*','#']
    for i in range(len(self.template)):
      for j in range(len(self.template[0])):
        if self.template[i][j] == ' ': grid += ' '
        elif len(self.cells[(i,j)]) == 1: grid += self.cells[(i,j)]
        else: grid += '*'
#        elif len(self.cells[(i,j)]) < 5: grid += '#'
#        elif len(self.cells[(i,j)]) < 10: grid += '*'
#        elif len(self.cells[(i,j)]) < 15: grid += '+'
#        elif len(self.cells[(i,j)]) < 20: grid += ','
#        elif len(self.cells[(i,j)]) < 24: grid += '-'
#        elif len(self.cells[(i,j)]) < 26: grid += '.'
#        else: grid += ' '
        grid += ' '
      grid += '\n '
    return grid
  
  def toReturn(self):
    toRet = ''
    for i in range(len(self.template)):
      for j in range(len(self.template)):
        if self.template[i][j] == ' ': toRet += ' '
        elif len(self.cells[(i,j)]) > 1: toRet += '*'
        else: toRet += self.cells[(i,j)]
    return toRet
  
  @timing
  def updateAll(self):
    #done = []
    for cell in self.cells.keys():
    #  if cell in done:
    #    continue
      delta = self.update(cell, Delta(self.template))
    #  done += delta.updatedCells()
  
  @timing
  def decide(self, cell, assignment):
    delta = Delta(self.template)
    delta.removedCells[cell] = self.cells[cell].replace(assignment, '')
    self.cells[cell] = assignment
    self.assignments.append((cell, assignment))
    return self.update(cell, delta)
  
  @timing
  def update(self, start, delta = None):
    trackingChanges = delta != None
    queue = [(start,(gridNav.getAcrossStart(self.template, start), gridNav.getDownStart(self.template, start)))]
    while len(queue) > 0:
      cell, words = queue.pop(0)
      across, down = words
      
      # across
      if across != None:
        index = cell[1] - across[1]
        toRemove = []
        stuffRemoved = False
        for word in self.across[across]:
          if word[index] not in self.cells[cell]:
            toRemove.append(word)
            stuffRemoved = True
        for rem in toRemove:
          if trackingChanges: delta.removedAcross[across].append(rem)
          self.across[across].remove(rem)
          if len(self.across[across]) == 0:
            delta.isDeadEnd = True
            return delta
        if stuffRemoved:
          for nextCell in gridNav.getAcrossCells(self.template, across):
            lettersRemoved = False
            examined = ''
            for rem in toRemove:
              letter = rem[nextCell[1] - across[1]]
              if letter in examined: continue
              examined += letter
              removeLetter = True
              for acrossWord in self.across[across]:
                if acrossWord[nextCell[1] - across[1]] == letter:
                  removeLetter = False
                  break
              if removeLetter:
                self.cells[nextCell] = self.cells[nextCell].replace(letter, '')
                if trackingChanges: delta.removedCells[nextCell] += letter
                if len(self.cells[nextCell]) == 0:
                  delta.isDeadEnd = True
                  return delta
                lettersRemoved = True
            if lettersRemoved:
              queue.append((nextCell,(gridNav.getAcrossStart(self.template, nextCell), gridNav.getDownStart(self.template, nextCell))))
      
      # down
      if down != None:
        index = cell[0] - down[0]
        toRemove = []
        stuffRemoved = False
        for word in self.down[down]:
          if word[index] not in self.cells[cell]:
            toRemove.append(word)
            stuffRemoved = True
        for rem in toRemove:
          if trackingChanges: delta.removedDown[down].append(rem)
          self.down[down].remove(rem)
          if len(self.down[down]) == 0:
            delta.isDeadEnd = True
            return delta
        if stuffRemoved:
          for nextCell in gridNav.getDownCells(self.template, down):
            examined = ''
            lettersRemoved = False
            for rem in toRemove:
              letter = rem[nextCell[0] - down[0]]
              if letter in examined: continue
              examined += letter
              removeLetter = True
              for downWord in self.down[down]:
                if downWord[nextCell[0] - down[0]] == letter:
                  removeLetter = False
                  break
              if removeLetter:
                self.cells[nextCell] = self.cells[nextCell].replace(letter, '')
                if trackingChanges: delta.removedCells[nextCell] += letter
                if len(self.cells[nextCell]) == 0:
                  delta.isDeadEnd = True
                  return delta
                lettersRemoved = True
            if lettersRemoved:
              queue.append((nextCell,(gridNav.getAcrossStart(self.template, nextCell), gridNav.getDownStart(self.template, nextCell))))
    
    return delta
  
  @timing
  def restore(self, removed):
    for cell in removed.removedCells.keys():
      for ch in removed.removedCells[cell]:
        if ch not in self.cells[cell]:
          self.cells[cell] += ch
    for space in removed.removedAcross.keys():
      self.across[space] += removed.removedAcross[space]
    for space in removed.removedDown.keys():
      self.down[space] += removed.removedDown[space]
    self.assignments.pop()
  
  @timing
  def regionedCell(self):
    lowestCell = (-1,-1)
    regions = self.getRegions()
    smallestRegion = regions[-1]
    lowestValue = 27
    for cell in smallestRegion:
      if len(self.cells[cell]) == 1: continue
      if len(self.cells[cell]) < lowestValue:
        lowestValue = len(self.cells[cell])
        lowestCell = cell
    return lowestCell, smallestRegion
  
  @timing
  def isSolved(self):
    for cellPoss in self.cells.values():
      if len(cellPoss) != 1:
        return False
    return True

  @timing
  def getRegions(self):
    visited = []
    regions = []
    for cell in self.cells.keys():
      if len(self.cells[cell]) > 1 and cell not in visited:
        regions.append(self.floodfill(cell, visited))
    return sorted(regions, key=lambda reg: -len(reg))

  @timing
  def floodfill(self, cell, visited):
    region = []
    Q = []

    dirs = { (-1, 0), (1, 0), (0, -1), (0, 1) }

    Q.append( cell )
    visited.append(cell)

    while len(Q) > 0:
      (r, c) = Q.pop(0)
      region.append( (r, c) )
      for (dr, dc) in dirs:
        if (r+dr, c+dc) in self.cells.keys() and len(self.cells[(r+dr, c+dc)]) > 1 and (r+dr, c+dc) not in visited:
          Q.append((r + dr, c + dc))
          visited.append((r+dr, c+dc))
    return region
  
  @timing
  def getWordList(self):
    toRet = []
    for i in self.across.keys():
      wd = self.across[i][0]
      toRet.append(wd)
    for i in self.down.keys():
      wd = self.down[i][0]
      toRet.append(wd)
    return sorted(toRet)
  
  @timing
  def solve(self, printout=False):
    if printout: print self
    if self.isSolved():
      return (True,)
    cell, region = self.regionedCell()
    l = list(self.cells[cell])
    random.shuffle(l)
    letters = ''.join(l)
    for letter in letters:
      removed = self.decide(cell, letter)
      if removed.isDeadEnd:
        self.restore(removed)
        continue
      soln = self.solve(printout)
      if soln[0]:
        return (True,)
      self.restore(removed)
      #if soln[1] not in region:#removed.updatedCells():
      #  return (False, soln[1], soln[2])
    return (False, cell, region)
  
  def include(self, includeWords):
    print self
    if len(includeWords) == 0: return self.solve(True)
    word = includeWords.pop()
    # get all spaces the word can go
    spaces = [('a',space) for space in self.across.keys() if word in self.across[space]] + [('d',space) for space in self.down.keys() if word in self.down[space]]
    random.shuffle(spaces)
    for space in spaces:
      direction, assignment = space
      if direction == 'a': cells = gridNav.getAcrossCells(self.template, assignment)
      else: cells = gridNav.getDownCells(self.template, assignment)
      rem = []
      for chIndex in range(len(word)):
        rem.append(n.decide(cells[chIndex], word[chIndex]))
        print self
        if rem[-1].isDeadEnd:
          break
      if rem[-1].isDeadEnd:
        for r in rem[::-1]: self.restore(r)
        continue
      soln = self.include(includeWords)
      if soln[0]: return (True,)
      for r in rem[::-1]: self.restore(r)
    includeWords.append(word)
    return (False,)

def quickSolve(temp, excludeList):
  n = Grid(temp, excludeList)
  n.solve(True)
  retData = {}
  retData['solution'] = ''.join(n.toReturn())
  return retData

if __name__ == '__main__':
  f = open('/templates/15x15', 'r')
  l = f.read().split('\n')
  while '' in l: l.remove('')
  temp = l[2]
  n = Grid(temp)
  n.solve(True)





















































